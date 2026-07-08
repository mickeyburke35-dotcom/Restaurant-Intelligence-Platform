import {
  AuditEntityType,
  Prisma,
  SourceApprovalStatus
} from "@prisma/client";
import { createHash } from "node:crypto";
import { z } from "zod";
import { badRequest, notFound } from "@/lib/api-errors";
import { CsvParseError, parseCsv, type ParsedCsvRow } from "@/lib/csv-parser";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/lib/request-context";

const maxCsvCharacters = 1_000_000;
const maxCsvRows = 2_000;

type ReviewCsvField =
  | "approvedPublic"
  | "authorDisplayNameHash"
  | "externalReviewId"
  | "language"
  | "publishedAt"
  | "rating"
  | "reviewUrl"
  | "text"
  | "title";

type ReviewCsvRawRow = Partial<Record<ReviewCsvField, string>>;

type RejectionCategory = "MALFORMED" | "DUPLICATE_IN_FILE" | "DUPLICATE_EXISTING";

type ImportRowStatus = "READY" | "REJECTED";

type InternalImportRow = {
  data?: ValidReviewCsvRow;
  externalId?: string;
  reasonCategories: RejectionCategory[];
  reasons: string[];
  rowNumber: number;
  status: ImportRowStatus;
};

export type ReviewImportPreviewRow = {
  externalId: string | null;
  publishedAt: string | null;
  rating: number | null;
  reasons: string[];
  rowNumber: number;
  status: ImportRowStatus;
  textExcerpt: string | null;
  title: string | null;
};

export type ReviewImportPreview = {
  fileErrors: string[];
  rows: ReviewImportPreviewRow[];
  summary: {
    duplicateRows: number;
    existingDuplicateRows: number;
    malformedRows: number;
    readyRows: number;
    rejectedRows: number;
    totalRows: number;
  };
};

export type ReviewImportConfirmation = {
  importedCount: number;
  preview: ReviewImportPreview;
};

export const reviewImportRequestSchema = z
  .object({
    approvedPublicData: z
      .boolean()
      .refine((value) => value, "Confirm the CSV contains only approved public review data."),
    csvText: z.string().trim().min(1).max(maxCsvCharacters),
    locationId: z.string().uuid(),
    restaurantId: z.string().uuid(),
    reviewSourceId: z.string().uuid()
  })
  .strict();

export type ReviewImportRequest = z.infer<typeof reviewImportRequestSchema>;

const optionalNullableString = (maxLength: number) =>
  z
    .preprocess(
      (value) => {
        if (value === undefined || value === null) {
          return undefined;
        }

        return String(value).trim();
      },
      z.string().max(maxLength).optional()
    )
    .transform((value) => (value && value.length > 0 ? value : null));

const ratingSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();

  if (trimmed.length === 0) {
    return null;
  }

  return Number(trimmed);
}, z.number({ invalid_type_error: "Rating must be a number." }).min(1).max(5).nullable());

const approvedPublicSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized.length === 0) {
    return undefined;
  }

  if (["1", "approved", "public", "true", "yes", "y"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "n", "private", "unapproved"].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean({ invalid_type_error: "Approved public must be true or false." }).optional());

const reviewCsvRowSchema = z
  .object({
    approvedPublic: approvedPublicSchema,
    authorDisplayNameHash: optionalNullableString(255),
    externalReviewId: z.string().trim().min(1).max(255),
    language: optionalNullableString(20),
    publishedAt: z
      .string()
      .trim()
      .min(1)
      .transform((value, context) => {
        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Published date must be a valid date."
          });

          return z.NEVER;
        }

        return parsedDate;
      }),
    rating: ratingSchema,
    reviewUrl: optionalNullableString(2048).pipe(
      z
        .string()
        .url("Review URL must be a valid URL.")
        .nullable()
    ),
    text: optionalNullableString(10_000),
    title: optionalNullableString(255)
  })
  .superRefine((value, context) => {
    if (value.approvedPublic === false) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Row is not marked as approved public review data.",
        path: ["approvedPublic"]
      });
    }

    if (value.rating === null && !value.text) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Review rows require a rating or review text."
      });
    }
  });

type ValidReviewCsvRow = z.infer<typeof reviewCsvRowSchema>;

const headerAliases = new Map<string, ReviewCsvField>([
  ["approved_public", "approvedPublic"],
  ["approved_public_data", "approvedPublic"],
  ["author_display_name_hash", "authorDisplayNameHash"],
  ["author_hash", "authorDisplayNameHash"],
  ["author_name_hash", "authorDisplayNameHash"],
  ["body", "text"],
  ["content", "text"],
  ["date", "publishedAt"],
  ["external_id", "externalReviewId"],
  ["external_review_id", "externalReviewId"],
  ["is_public", "approvedPublic"],
  ["language", "language"],
  ["provider_review_id", "externalReviewId"],
  ["public_review", "approvedPublic"],
  ["published_at", "publishedAt"],
  ["published_date", "publishedAt"],
  ["rating", "rating"],
  ["review_date", "publishedAt"],
  ["review_id", "externalReviewId"],
  ["review_text", "text"],
  ["review_url", "reviewUrl"],
  ["source_url", "reviewUrl"],
  ["text", "text"],
  ["title", "title"],
  ["url", "reviewUrl"]
]);

const disallowedHeaders = new Set([
  "author_display_name",
  "author_email",
  "author_name",
  "customer_email",
  "customer_id",
  "customer_name",
  "email",
  "phone",
  "phone_number"
]);

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function validationMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}

function dedupeMessages(messages: string[]): string[] {
  return Array.from(new Set(messages));
}

function textExcerpt(text: string | null): string | null {
  if (!text) {
    return null;
  }

  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function payloadHash(row: ValidReviewCsvRow): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        externalReviewId: row.externalReviewId,
        publishedAt: row.publishedAt.toISOString(),
        rating: row.rating,
        reviewUrl: row.reviewUrl,
        text: row.text,
        title: row.title
      })
    )
    .digest("hex");
}

function buildHeaderMap(headers: string[]): {
  fieldByColumn: Array<ReviewCsvField | null>;
  fileErrors: string[];
} {
  const seenFields = new Set<ReviewCsvField>();
  const fieldByColumn: Array<ReviewCsvField | null> = [];
  const fileErrors: string[] = [];

  headers.forEach((header) => {
    const normalizedHeader = normalizeHeader(header);
    const field = headerAliases.get(normalizedHeader) ?? null;

    if (normalizedHeader.length === 0) {
      fieldByColumn.push(null);
      fileErrors.push("CSV contains an empty header.");
      return;
    }

    if (disallowedHeaders.has(normalizedHeader)) {
      fieldByColumn.push(null);
      fileErrors.push(
        `Column "${header}" is not allowed. Import hashed author display names only.`
      );
      return;
    }

    if (!field) {
      fieldByColumn.push(null);
      fileErrors.push(`Column "${header}" is not supported for review import.`);
      return;
    }

    if (seenFields.has(field)) {
      fieldByColumn.push(null);
      fileErrors.push(`Column "${header}" duplicates an existing import field.`);
      return;
    }

    seenFields.add(field);
    fieldByColumn.push(field);
  });

  if (!seenFields.has("externalReviewId")) {
    fileErrors.push("CSV must include external_review_id.");
  }

  if (!seenFields.has("publishedAt")) {
    fileErrors.push("CSV must include published_at.");
  }

  return {
    fieldByColumn,
    fileErrors: dedupeMessages(fileErrors)
  };
}

function rowToRawObject(row: ParsedCsvRow, fieldByColumn: Array<ReviewCsvField | null>): ReviewCsvRawRow {
  const rawRow: ReviewCsvRawRow = {};

  fieldByColumn.forEach((field, index) => {
    if (field) {
      rawRow[field] = row.cells[index] ?? "";
    }
  });

  return rawRow;
}

function rejectRow(rowNumber: number, reasons: string[]): InternalImportRow {
  return {
    reasonCategories: ["MALFORMED"],
    reasons: dedupeMessages(reasons),
    rowNumber,
    status: "REJECTED"
  };
}

function publicPreview(rows: InternalImportRow[], fileErrors: string[]): ReviewImportPreview {
  const previewRows = rows.map<ReviewImportPreviewRow>((row) => ({
    externalId: row.externalId ?? row.data?.externalReviewId ?? null,
    publishedAt: row.data?.publishedAt.toISOString() ?? null,
    rating: row.data?.rating ?? null,
    reasons: row.reasons,
    rowNumber: row.rowNumber,
    status: row.status,
    textExcerpt: textExcerpt(row.data?.text ?? null),
    title: row.data?.title ?? null
  }));

  return {
    fileErrors,
    rows: previewRows,
    summary: {
      duplicateRows: rows.filter((row) => row.reasonCategories.includes("DUPLICATE_IN_FILE")).length,
      existingDuplicateRows: rows.filter((row) =>
        row.reasonCategories.includes("DUPLICATE_EXISTING")
      ).length,
      malformedRows: rows.filter((row) => row.reasonCategories.includes("MALFORMED")).length,
      readyRows: rows.filter((row) => row.status === "READY").length,
      rejectedRows: rows.filter((row) => row.status === "REJECTED").length,
      totalRows: rows.length
    }
  };
}

function emptyPreview(fileErrors: string[]): {
  internalRows: InternalImportRow[];
  preview: ReviewImportPreview;
} {
  const internalRows: InternalImportRow[] = [];

  return {
    internalRows,
    preview: publicPreview(internalRows, fileErrors)
  };
}

async function assertImportTargets(context: RequestContext, input: ReviewImportRequest) {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: input.restaurantId
    },
    select: {
      id: true
    }
  });

  if (!restaurant) {
    throw notFound("Restaurant not found.");
  }

  const location = await prisma.location.findFirst({
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: input.locationId,
      restaurantId: input.restaurantId
    },
    select: {
      id: true
    }
  });

  if (!location) {
    throw badRequest("Location must belong to the selected restaurant and agency.");
  }

  const reviewSource = await prisma.reviewSource.findFirst({
    where: {
      agencyId: context.agencyId,
      deletedAt: null,
      id: input.reviewSourceId,
      restaurantId: input.restaurantId
    },
    select: {
      approvalStatus: true,
      id: true,
      locationId: true
    }
  });

  if (!reviewSource) {
    throw notFound("Review source not found.");
  }

  if (reviewSource.approvalStatus !== SourceApprovalStatus.APPROVED) {
    throw badRequest("Review source must be approved before importing reviews.");
  }

  if (reviewSource.locationId && reviewSource.locationId !== input.locationId) {
    throw badRequest("Review source must match the selected location.");
  }
}

async function prepareReviewImport(
  context: RequestContext,
  input: ReviewImportRequest
): Promise<{
  internalRows: InternalImportRow[];
  preview: ReviewImportPreview;
}> {
  await assertImportTargets(context, input);

  let parsedCsv;

  try {
    parsedCsv = parseCsv(input.csvText);
  } catch (error) {
    if (error instanceof CsvParseError) {
      return emptyPreview([error.message]);
    }

    throw error;
  }

  if (parsedCsv.rows.length > maxCsvRows) {
    return emptyPreview([`CSV import is limited to ${maxCsvRows} rows.`]);
  }

  const { fieldByColumn, fileErrors } = buildHeaderMap(parsedCsv.headers);

  if (fileErrors.length > 0) {
    return emptyPreview(fileErrors);
  }

  const internalRows = parsedCsv.rows.map<InternalImportRow>((row) => {
    if (row.cells.length !== parsedCsv.headers.length) {
      return rejectRow(row.rowNumber, [
        `Expected ${parsedCsv.headers.length} columns but found ${row.cells.length}.`
      ]);
    }

    const result = reviewCsvRowSchema.safeParse(rowToRawObject(row, fieldByColumn));

    if (!result.success) {
      return rejectRow(row.rowNumber, validationMessages(result.error));
    }

    return {
      data: result.data,
      externalId: result.data.externalReviewId,
      reasonCategories: [],
      reasons: [],
      rowNumber: row.rowNumber,
      status: "READY"
    };
  });

  const externalIdCounts = new Map<string, number>();
  const validExternalIds = internalRows.flatMap((row) => {
    if (!row.data) {
      return [];
    }

    const currentCount = externalIdCounts.get(row.data.externalReviewId) ?? 0;
    externalIdCounts.set(row.data.externalReviewId, currentCount + 1);

    return [row.data.externalReviewId];
  });

  const existingReviews =
    validExternalIds.length > 0
      ? await prisma.review.findMany({
          where: {
            agencyId: context.agencyId,
            externalId: {
              in: Array.from(new Set(validExternalIds))
            },
            reviewSourceId: input.reviewSourceId
          },
          select: {
            externalId: true
          }
        })
      : [];

  const existingExternalIds = new Set(existingReviews.map((review) => review.externalId));

  internalRows.forEach((row) => {
    if (!row.data) {
      return;
    }

    const reasons: string[] = [];
    const categories: RejectionCategory[] = [];

    if ((externalIdCounts.get(row.data.externalReviewId) ?? 0) > 1) {
      reasons.push("External review ID appears more than once in this CSV.");
      categories.push("DUPLICATE_IN_FILE");
    }

    if (existingExternalIds.has(row.data.externalReviewId)) {
      reasons.push("External review ID has already been imported for this review source.");
      categories.push("DUPLICATE_EXISTING");
    }

    if (reasons.length > 0) {
      row.reasons = dedupeMessages([...row.reasons, ...reasons]);
      row.reasonCategories = Array.from(new Set([...row.reasonCategories, ...categories]));
      row.status = "REJECTED";
    }
  });

  return {
    internalRows,
    preview: publicPreview(internalRows, [])
  };
}

export async function previewReviewImport(
  context: RequestContext,
  input: ReviewImportRequest
): Promise<ReviewImportPreview> {
  const { preview } = await prepareReviewImport(context, input);

  return preview;
}

export async function confirmReviewImport(
  context: RequestContext,
  input: ReviewImportRequest
): Promise<ReviewImportConfirmation> {
  const { internalRows, preview } = await prepareReviewImport(context, input);
  const readyRows = internalRows.filter(
    (row): row is InternalImportRow & { data: ValidReviewCsvRow } =>
      row.status === "READY" && row.data !== undefined
  );

  if (readyRows.length === 0) {
    return {
      importedCount: 0,
      preview
    };
  }

  const importStartedAt = new Date();
  const createInput: Prisma.ReviewCreateManyInput[] = readyRows.map((row) => ({
    agencyId: context.agencyId,
    authorDisplayNameHash: row.data.authorDisplayNameHash,
    collectedAt: importStartedAt,
    externalId: row.data.externalReviewId,
    language: row.data.language,
    locationId: input.locationId,
    metadata: {
      approvedPublicData: true,
      importMethod: "CSV",
      importedAt: importStartedAt.toISOString(),
      importedByUserId: context.userId,
      sourceRowNumber: row.rowNumber
    },
    publishedAt: row.data.publishedAt,
    rating: row.data.rating,
    restaurantId: input.restaurantId,
    reviewSourceId: input.reviewSourceId,
    reviewUrl: row.data.reviewUrl,
    sourcePayloadHash: payloadHash(row.data),
    text: row.data.text,
    title: row.data.title
  }));

  const result = await prisma.review.createMany({
    data: createInput,
    skipDuplicates: true
  });

  await prisma.auditLog.create({
    data: {
      action: "review_import_confirmed",
      agencyId: context.agencyId,
      entityId: input.reviewSourceId,
      entityType: AuditEntityType.REVIEW_SOURCE,
      metadata: {
        importedCount: result.count,
        rejectedRows: preview.summary.rejectedRows,
        reviewSourceId: input.reviewSourceId,
        totalRows: preview.summary.totalRows
      },
      userId: context.userId
    }
  });

  return {
    importedCount: result.count,
    preview
  };
}
