"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { DemoHubLink } from "@/components/demo-hub-link";

const csvTemplate =
  "restaurantId,locationId,reviewSourceId,externalReviewId,rating,reviewText,reviewedAt,sourceUrl";

type PreviewSummary = {
  duplicateRows: number;
  existingDuplicateRows: number;
  invalidTargetRows: number;
  malformedRows: number;
  readyRows: number;
  rejectedRows: number;
  totalRows: number;
};

type PreviewRow = {
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
  status: "READY" | "REJECTED";
};

type ReviewImportPreview = {
  fileErrors: string[];
  rows: PreviewRow[];
  summary: PreviewSummary;
};

type ReviewImportConfirmation = {
  importedCount: number;
  preview: ReviewImportPreview;
};

type ApiErrorResult = {
  error: {
    details?: unknown;
    message: string;
  };
};

type ApiResult<T> = { data: T } | ApiErrorResult;

function isApiError<T>(result: ApiResult<T>): result is ApiErrorResult {
  return "error" in result;
}

function inputClassName() {
  return "w-full rounded-md border border-line bg-snow px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen";
}

function statusClassName(status: PreviewRow["status"]) {
  return status === "READY"
    ? "border border-positive/30 bg-positive/10 text-positive"
    : "border border-negative/30 bg-negative/10 text-negative";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function shortId(value: string | null) {
  if (!value) {
    return "-";
  }

  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

export default function ReviewImportPage() {
  const [csvText, setCsvText] = useState("");
  const [approvedPublicData, setApprovedPublicData] = useState(false);
  const [preview, setPreview] = useState<ReviewImportPreview | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const readyRows = preview?.summary.readyRows ?? 0;
  const rejectedRows = preview?.summary.rejectedRows ?? 0;
  const canPreview = useMemo(
    () => csvText.trim().length > 0 && approvedPublicData,
    [approvedPublicData, csvText]
  );

  async function readImportResponse<T>(response: Response): Promise<T> {
    const result = (await response.json()) as ApiResult<T>;

    if (!response.ok || isApiError(result)) {
      throw new Error(isApiError(result) ? result.error.message : "Import request failed.");
    }

    return result.data;
  }

  function requestBody() {
    return {
      approvedPublicData,
      csvText
    };
  }

  function resetResultState() {
    setPreview(null);
    setImportedCount(null);
    setErrorMessage(null);
  }

  async function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setImportedCount(null);
    setIsPreviewing(true);

    try {
      const response = await fetch("/api/reviews/import/preview", {
        body: JSON.stringify(requestBody()),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });
      const data = await readImportResponse<ReviewImportPreview>(response);
      setPreview(data);
    } catch (error) {
      setPreview(null);
      setErrorMessage(error instanceof Error ? error.message : "Import preview failed.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function confirmImport() {
    setErrorMessage(null);
    setImportedCount(null);
    setIsImporting(true);

    try {
      const response = await fetch("/api/reviews/import/confirm", {
        body: JSON.stringify(requestBody()),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });
      const data = await readImportResponse<ReviewImportConfirmation>(response);
      setImportedCount(data.importedCount);
      setPreview(data.preview);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Import confirmation failed.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleCsvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvText(await file.text());
    resetResultState();
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8">
        <DemoHubLink />

        <header className="flex flex-col gap-3 border-b border-line pb-6">
          <p className="text-sm font-semibold uppercase text-pine">Reviews</p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Review Import</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Preview approved public CSV rows, resolve rejected rows, and import only ready
                reviews.
              </p>
            </div>
            {importedCount !== null ? (
              <div className="rounded-md border border-positive/30 bg-positive/10 px-4 py-3 text-sm font-semibold text-positive">
                Imported {importedCount} reviews
              </div>
            ) : null}
          </div>
        </header>

        <form className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)]" onSubmit={submitPreview}>
          <section className="flex flex-col gap-6 border-r-0 border-line lg:border-r lg:pr-8">
            <div className="rounded-md border border-line bg-panel p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase text-muted">Required columns</p>
              <p className="mt-2 break-words font-mono text-xs leading-5 text-ink">
                {csvTemplate}
              </p>
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium text-ink" htmlFor="csv-file">
                CSV File
              </label>
              <input
                accept=".csv,text/csv"
                className="w-full rounded-md border border-dashed border-line bg-snow px-3 py-3 text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-pine file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:outline-none focus:ring-2 focus:ring-lichen"
                id="csv-file"
                onChange={handleCsvFile}
                type="file"
              />
              <textarea
                className={`${inputClassName()} min-h-72 font-mono text-xs leading-5`}
                onChange={(event) => {
                  setCsvText(event.target.value);
                  resetResultState();
                }}
                placeholder={csvTemplate}
                value={csvText}
              />
            </div>

            <label className="flex items-start gap-3 rounded-md border border-line bg-panel p-3 text-sm leading-6 text-muted">
              <input
                checked={approvedPublicData}
                className="mt-1 h-4 w-4 accent-pine"
                onChange={(event) => {
                  setApprovedPublicData(event.target.checked);
                  setImportedCount(null);
                }}
                type="checkbox"
              />
              <span>CSV contains only approved public review data.</span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-canvas active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#9bb4ad]"
                disabled={!canPreview || isPreviewing}
                type="submit"
              >
                {isPreviewing ? "Previewing" : "Preview"}
              </button>
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-panel px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 focus:ring-offset-canvas active:translate-y-px disabled:cursor-not-allowed disabled:border-line disabled:text-subtle"
                disabled={!preview || readyRows === 0 || isImporting || importedCount !== null}
                onClick={confirmImport}
                type="button"
              >
                {isImporting ? "Importing" : "Import ready rows"}
              </button>
            </div>
          </section>

          <section className="min-w-0">
            {errorMessage ? (
              <div className="mb-5 rounded-md border border-negative/30 bg-negative/10 px-4 py-3 text-sm font-medium text-negative">
                {errorMessage}
              </div>
            ) : null}

            {preview ? (
              <div className="flex flex-col gap-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <div className="rounded-md border border-line bg-panel p-4">
                    <p className="text-xs font-medium uppercase text-muted">Total</p>
                    <p className="mt-2 text-2xl font-semibold">{preview.summary.totalRows}</p>
                  </div>
                  <div className="rounded-md border border-positive/30 bg-positive/10 p-4">
                    <p className="text-xs font-medium uppercase text-muted">Ready</p>
                    <p className="mt-2 text-2xl font-semibold text-positive">
                      {preview.summary.readyRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-negative/30 bg-negative/10 p-4">
                    <p className="text-xs font-medium uppercase text-muted">Rejected</p>
                    <p className="mt-2 text-2xl font-semibold text-negative">
                      {preview.summary.rejectedRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-mixed/30 bg-mixed/10 p-4">
                    <p className="text-xs font-medium uppercase text-muted">Duplicates</p>
                    <p className="mt-2 text-2xl font-semibold text-mixed">
                      {preview.summary.duplicateRows + preview.summary.existingDuplicateRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-line bg-panel p-4">
                    <p className="text-xs font-medium uppercase text-muted">Targets</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {preview.summary.invalidTargetRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-line bg-panel p-4">
                    <p className="text-xs font-medium uppercase text-muted">Malformed</p>
                    <p className="mt-2 text-2xl font-semibold">{preview.summary.malformedRows}</p>
                  </div>
                </div>

                {preview.fileErrors.length > 0 ? (
                  <div className="rounded-md border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-negative">
                    {preview.fileErrors.map((fileError) => (
                      <p key={fileError}>{fileError}</p>
                    ))}
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-md border border-line bg-panel shadow-soft">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <h2 className="text-sm font-semibold">Preview</h2>
                    <p className="text-sm text-muted">
                      {readyRows} ready, {rejectedRows} rejected
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1120px] divide-y divide-line text-left text-sm">
                      <thead className="bg-snow text-xs uppercase text-muted">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Row</th>
                          <th className="px-4 py-3 font-semibold">Restaurant</th>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Source</th>
                          <th className="px-4 py-3 font-semibold">External ID</th>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Rating</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Review</th>
                          <th className="px-4 py-3 font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {preview.rows.map((row) => (
                          <tr key={row.rowNumber} className="align-top">
                            <td className="px-4 py-3 font-medium">{row.rowNumber}</td>
                            <td className="px-4 py-3" title={row.restaurantId ?? undefined}>
                              {shortId(row.restaurantId)}
                            </td>
                            <td className="px-4 py-3" title={row.locationId ?? undefined}>
                              {shortId(row.locationId)}
                            </td>
                            <td className="px-4 py-3" title={row.reviewSourceId ?? undefined}>
                              {shortId(row.reviewSourceId)}
                            </td>
                            <td className="px-4 py-3">{row.externalReviewId ?? "-"}</td>
                            <td className="px-4 py-3">{formatDate(row.reviewedAt)}</td>
                            <td className="px-4 py-3">{row.rating ?? "-"}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClassName(row.status)}`}
                              >
                                {row.status === "READY" ? "Ready" : "Rejected"}
                              </span>
                            </td>
                            <td className="max-w-xs px-4 py-3 text-muted">
                              {row.reviewTextExcerpt ?? "-"}
                            </td>
                            <td className="max-w-sm px-4 py-3 text-muted">
                              {row.reasons.length > 0 ? row.reasons.join(" ") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[520px] items-center justify-center rounded-md border border-dashed border-line bg-panel p-8 text-center">
                <div className="max-w-md">
                  <h2 className="text-lg font-semibold text-ink">Ready for a CSV preview</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Upload or paste approved public review rows, confirm the source permission, and
                    preview row readiness before import.
                  </p>
                </div>
              </div>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
