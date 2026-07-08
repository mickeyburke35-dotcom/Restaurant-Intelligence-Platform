import { AuditEntityType, Prisma, SourceApprovalStatus } from "@prisma/client";
import { createHash } from "node:crypto";
import { z } from "zod";
import { CsvParseError, parseCsv, type ParsedCsvRow } from "@/lib/csv-parser";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/lib/request-context";

const maxCsvCharacters = 1_000_000;
const maxCsvRows = 2_000;

type ReviewCsvField =
  | "externalReviewId"
  | "locationId"
  | "rating"
  | "restaurantId"
  | "reviewSourceId"
  | "reviewText"
  | "reviewedAt"
  | "sourceUrl";

type ReviewCsvRawRow = Partial<Record<ReviewCsvField, string>>;

type RejectionCategory =
  | "DUPLICATE_EXISTING"
  | "DUPLICATE_IN_FILE"
  | "INVALID_TARGET"
  | "MALFORMED";

type ImportRowStatus = "READY" | "REJECTED";

type InternalImportRow = {
  data?: ValidReviewCsvRow;
  duplicateKey?: string;
  externalReviewId?: string;
  reasonCategories: RejectionCategory[];
  reasons: string[];
  rowNumber: number;
  status: ImportRowStatus;
};

export type ReviewImportPreviewRow = {
  externalReviewId: string | null;
  locationId: string | null;
  rating: number | null;
  reasons: string[];
  restaurantId: string | null;
  reviewedAt: string | null;
  reviewSourceId: string | null;
  reviewTextExcerpt: string | null;
  rowNumber: number;
  sourceUrl: string | null;
  status: ImportRowStatus;
};

export type ReviewImportPreview = {
  fileErrors: string[];
  rows: ReviewImportPreviewRow[];
  summary: {
    duplicateRows: number;
    existingDuplicateRows: number;
    invalidTargetRows: number;
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
    csvText: z.string().trim().min(1).max(maxCsvCharacters)
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
    return value;
  }

  const trimmed = String(value).trim();

  if (trimmed.length === 0) {
    return value;
  }

  return Number(trimmed);
}, z.number({ invalid_type_error: "Rating must be a number." }).min(1).max(5));

const sourceUrlSchema = optionalNullableString(2048).pipe(
  z.string().url("Source URL must be a valid URL.").nullable()
);

const reviewCsvRowSchema = z
  .object({
    externalReviewId: z.string().trim().min(1).max(255),
    locationId: z.string().trim().uuid("Location ID must be a valid UUID."),
    rating: ratingSchema,
    restaurantId: z.string().trim().uuid("Restaurant ID must be a valid UUID."),
    reviewSourceId: z.string().trim().uuid("Review source ID must be a valid UUID."),
    reviewText: z.string().trim().min(1).max(10_000),
    reviewedAt: z
      .string()
      .trim()
      .min(1)
      .transform((value, context) => {
        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reviewed date must be a valid date."
          });

          return z.NEVER;
        }

        return parsedDate;
      }),
    sourceUrl: sourceUrlSchema
  })
  .strict();

type ValidReviewCsvRow = z.infer<typeof reviewCsvRowSchema>;

const headerAliases = new Map<string, ReviewCsvField>([
  ["external_id", "externalReviewId"],
  ["external_review_id", "externalReviewId"],
  ["location_id", "locationId"],
  ["rating", "rating"],
  ["restaurant_id", "restaurantId"],
  ["review_id", "externalReviewId"],
  ["review_source_id", "reviewSourceId"],
  ["review_text", "reviewText"],
  ["reviewed_at", "reviewedAt"],
  ["reviewed_date", "reviewedAt"],
  ["source_url", "sourceUrl"]
]);

const requiredFields: ReviewCsvField[] = [
  "restaurantId",
  "locationId",
  "reviewSourceId",
  "externalReviewId",
  "rating",
  "reviewText",
  "reviewedAt"
];

const fieldDisplayNames: Record<ReviewCsvField, string> = {
  externalReviewId: "externalReviewId",
  locationId: "locationId",
  rating: "rating",
  restaurantId: "restaurantId",
  reviewSourceId: "reviewSourceId",
  reviewText: "reviewText",
  reviewedAt: "reviewedAt",
  sourceUrl: "sourceUrl"
};

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
  return header
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function validationMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}

function dedupeMessages(messages: string[]): string[] {
  return Array.from(new Set(messages));
}

function reviewTextExcerpt(text: string | null): string | null {
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
        locationId: row.locationId,
        rating: row.rating,
        restaurantId: row.restaurantId,
        reviewSourceId: row.reviewSourceId,
        reviewedAt: row.reviewedAt.toISOString(),
        reviewText: row.reviewText,
        sourceUrl: row.sourceUrl
      })
    )
    .digest("hex");
}

function duplicateKey(row: Pick<ValidReviewCsvRow, "externalReviewId" | "reviewSourceId">): string {
  return `${row.reviewSourceId}:${row.externalReviewId}`;
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
      fileErrors.push(`Column "${header}" is not allowed for public review import.`);
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

  requiredFields.forEach((field) => {
    if (!seenFields.has(field)) {
      fileErrors.push(`CSV must include ${fieldDisplayNames[field]}.`);
    }
  });

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

function rejectPreparedRow(
  row: InternalImportRow,
  categories: RejectionCategory[],
  reasons: string[]
) {
  row.reasonCategories = Array.from(new Set([...row.reasonCategories, ...categories]));
  row.reasons = dedupeMessages([...row.reasons, ...reasons]);
  row.status = "REJECTED";
}

function publicPreview(rows: InternalImportRow[], fileErrors: string[]): ReviewImportPreview {
  const previewRows = rows.map<ReviewImportPreviewRow>((row) => ({
    externalReviewId: row.externalReviewId ?? row.data?.externalReviewId ?? null,
    locationId: row.data?.locationId ?? null,
    rating: row.data?.rating ?? null,
    reasons: row.reasons,
    restaurantId: row.data?.restaurantId ?? null,
    reviewedAt: row.data?.reviewedAt.toISOString() ?? null,
    reviewSourceId: row.data?.reviewSourceId ?? null,
    reviewTextExcerpt: reviewTextExcerpt(row.data?.reviewText ?? null),
    rowNumber: row.rowNumber,
    sourceUrl: row.data?.sourceUrl ?? null,
    status: row.status
  }));

  return {
    fileErrors,
    rows: previewRows,
    summary: {
      duplicateRows: rows.filter((row) => row.reasonCategories.includes("DUPLICATE_IN_FILE")).length,
      existingDuplicateRows: rows.filter((row) =>
        row.reasonCategories.includes("DUPLICATE_EXISTING")
      ).length,
      invalidTargetRows: rows.filter((row) => row.reasonCategories.includes("INVALID_TARGET"))
        .length,
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

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values));
}

async function validateImportTargets(
  context: RequestContext,
  internalRows: InternalImportRow[]
): Promise<void> {
  const validRows = internalRows.filter(
    (row): row is InternalImportRow & { data: ValidReviewCsvRow } => row.data !== undefined
  );

  if (validRows.length === 0) {
    return;
  }

  const restaurantIds = uniqueValues(validRows.map((row) => row.data.restaurantId));
  const locationIds = uniqueValues(validRows.map((row) => row.data.locationId));
  const reviewSourceIds = uniqueValues(validRows.map((row) => row.data.reviewSourceId));

  const [restaurants, locations, reviewSources] = await prisma.$transaction([
    prisma.restaurant.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        id: {
          in: restaurantIds
        }
      },
      select: {
        id: true
      }
    }),
    prisma.location.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        id: {
          in: locationIds
        }
      },
      select: {
        id: true,
        restaurantId: true
      }
    }),
    prisma.reviewSource.findMany({
      where: {
        agencyId: context.agencyId,
        deletedAt: null,
        id: {
          in: reviewSourceIds
        }
      },
      select: {
        approvalStatus: true,
        id: true,
        locationId: true,
        restaurantId: true
      }
    })
  ]);

  const restaurantIdsInAgency = new Set(restaurants.map((restaurant) => restaurant.id));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const reviewSourceById = new Map(reviewSources.map((reviewSource) => [reviewSource.id, reviewSource]));

  validRows.forEach((row) => {
    const reasons: string[] = [];

    if (!restaurantIdsInAgency.has(row.data.restaurantId)) {
      reasons.push("Restaurant was not found in this agency.");
    }

    if (context.restaurantId && context.restaurantId !== row.data.restaurantId) {
      reasons.push("Restaurant is outside your membership scope.");
    }

    const location = locationById.get(row.data.locationId);

    if (!location || location.restaurantId !== row.data.restaurantId) {
      reasons.push("Location must belong to the row restaurant and agency.");
    }

    const reviewSource = reviewSourceById.get(row.data.reviewSourceId);

    if (!reviewSource) {
      reasons.push("Review source was not found in this agency.");
    } else {
      if (!reviewSource.restaurantId) {
        reasons.push("Review source must belong to a restaurant.");
      } else if (reviewSource.restaurantId !== row.data.restaurantId) {
        reasons.push("Review source must belong to the row restaurant.");
      }

      if (reviewSource.locationId && reviewSource.locationId !== row.data.locationId) {
        reasons.push("Review source must match the row location.");
      }

      if (reviewSource.approvalStatus !== SourceApprovalStatus.APPROVED) {
        reasons.push("Review source must be approved before importing reviews.");
      }
    }

    if (reasons.length > 0) {
      rejectPreparedRow(row, ["INVALID_TARGET"], reasons);
    }
  });
}

async function rejectDuplicateReviewRows(
  context: RequestContext,
  internalRows: InternalImportRow[]
): Promise<void> {
  const validRows = internalRows.filter(
    (row): row is InternalImportRow & { data: ValidReviewCsvRow } => row.data !== undefined
  );

  if (validRows.length === 0) {
    return;
  }

  const duplicateKeyCounts = new Map<string, number>();

  validRows.forEach((row) => {
    row.duplicateKey = duplicateKey(row.data);
    duplicateKeyCounts.set(row.duplicateKey, (duplicateKeyCounts.get(row.duplicateKey) ?? 0) + 1);
  });

  const reviewSourceIds = uniqueValues(validRows.map((row) => row.data.reviewSourceId));
  const externalReviewIds = uniqueValues(validRows.map((row) => row.data.externalReviewId));

  const existingReviews = await prisma.review.findMany({
    where: {
      agencyId: context.agencyId,
      externalId: {
        in: externalReviewIds
      },
      reviewSourceId: {
        in: reviewSourceIds
      }
    },
    select: {
      externalId: true,
      reviewSourceId: true
    }
  });

  const existingDuplicateKeys = new Set(
    existingReviews.map((review) =>
      duplicateKey({
        externalReviewId: review.externalId,
        reviewSourceId: review.reviewSourceId
      })
    )
  );

  validRows.forEach((row) => {
    const reasons: string[] = [];
    const categories: RejectionCategory[] = [];
    const rowDuplicateKey = row.duplicateKey ?? duplicateKey(row.data);

    if ((duplicateKeyCounts.get(rowDuplicateKey) ?? 0) > 1) {
      reasons.push("External review ID appears more than once in this CSV for this review source.");
      categories.push("DUPLICATE_IN_FILE");
    }

    if (existingDuplicateKeys.has(rowDuplicateKey)) {
      reasons.push("External review ID has already been imported for this review source.");
      categories.push("DUPLICATE_EXISTING");
    }

    if (reasons.length > 0) {
      rejectPreparedRow(row, categories, reasons);
    }
  });
}

async function prepareReviewImport(
  context: RequestContext,
  input: ReviewImportRequest
): Promise<{
  internalRows: InternalImportRow[];
  preview: ReviewImportPreview;
}> {
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
      duplicateKey: duplicateKey(result.data),
      externalReviewId: result.data.externalReviewId,
      reasonCategories: [],
      reasons: [],
      rowNumber: row.rowNumber,
      status: "READY"
    };
  });

  await validateImportTargets(context, internalRows);
  await rejectDuplicateReviewRows(context, internalRows);

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
    collectedAt: importStartedAt,
    externalId: row.data.externalReviewId,
    locationId: row.data.locationId,
    metadata: {
      approvedPublicData: true,
      importMethod: "CSV",
      importedAt: importStartedAt.toISOString(),
      importedByUserId: context.userId,
      sourceRowNumber: row.rowNumber
    },
    publishedAt: row.data.reviewedAt,
    rating: row.data.rating,
    restaurantId: row.data.restaurantId,
    reviewSourceId: row.data.reviewSourceId,
    reviewUrl: row.data.sourceUrl,
    sourcePayloadHash: payloadHash(row.data),
    text: row.data.reviewText
  }));

  const result = await prisma.review.createMany({
    data: createInput,
    skipDuplicates: true
  });

  await prisma.auditLog.create({
    data: {
      action: "review_import_confirmed",
      agencyId: context.agencyId,
      entityId: null,
      entityType: AuditEntityType.REVIEW,
      metadata: {
        importedCount: result.count,
        rejectedRows: preview.summary.rejectedRows,
        restaurantIds: uniqueValues(readyRows.map((row) => row.data.restaurantId)),
        reviewSourceIds: uniqueValues(readyRows.map((row) => row.data.reviewSourceId)),
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
