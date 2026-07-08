"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

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
  return "w-full rounded-md border border-[#cfd8d4] bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";
}

function statusClassName(status: PreviewRow["status"]) {
  return status === "READY"
    ? "bg-[#e5f4ec] text-[#1d6a43]"
    : "bg-[#f8e8e4] text-[#9d2f21]";
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
        <header className="flex flex-col gap-3 border-b border-[#d8ded9] pb-6">
          <p className="text-sm font-medium uppercase text-pine">Reviews</p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Review Import</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Preview and import approved public review CSV rows.
              </p>
            </div>
            {importedCount !== null ? (
              <div className="rounded-md border border-[#bfd8ce] bg-[#e5f4ec] px-4 py-3 text-sm font-medium text-[#1d6a43]">
                Imported {importedCount} reviews
              </div>
            ) : null}
          </div>
        </header>

        <form className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)]" onSubmit={submitPreview}>
          <section className="flex flex-col gap-6 border-r-0 border-[#d8ded9] lg:border-r lg:pr-8">
            <div className="rounded-md border border-[#d8ded9] bg-white p-4">
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
                className="w-full rounded-md border border-dashed border-[#aebbb6] bg-white px-3 py-3 text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-pine file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
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

            <label className="flex items-start gap-3 rounded-md border border-[#cfd8d4] bg-white p-3 text-sm leading-6 text-muted">
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
                className="rounded-md bg-pine px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18594e] disabled:cursor-not-allowed disabled:bg-[#9bb4ad]"
                disabled={!canPreview || isPreviewing}
                type="submit"
              >
                {isPreviewing ? "Previewing" : "Preview"}
              </button>
              <button
                className="rounded-md border border-steel px-4 py-2.5 text-sm font-semibold text-steel transition hover:bg-white disabled:cursor-not-allowed disabled:border-[#b8c3c1] disabled:text-[#9aa7a3]"
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
              <div className="mb-5 rounded-md border border-[#efc5bd] bg-[#fff4f2] px-4 py-3 text-sm text-[#9d2f21]">
                {errorMessage}
              </div>
            ) : null}

            {preview ? (
              <div className="flex flex-col gap-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <div className="rounded-md border border-[#d8ded9] bg-white p-4">
                    <p className="text-xs font-medium uppercase text-muted">Total</p>
                    <p className="mt-2 text-2xl font-semibold">{preview.summary.totalRows}</p>
                  </div>
                  <div className="rounded-md border border-[#bfd8ce] bg-[#f1faf5] p-4">
                    <p className="text-xs font-medium uppercase text-muted">Ready</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1d6a43]">
                      {preview.summary.readyRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-[#efc5bd] bg-[#fff4f2] p-4">
                    <p className="text-xs font-medium uppercase text-muted">Rejected</p>
                    <p className="mt-2 text-2xl font-semibold text-[#9d2f21]">
                      {preview.summary.rejectedRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-[#f0d89a] bg-[#fff9e8] p-4">
                    <p className="text-xs font-medium uppercase text-muted">Duplicates</p>
                    <p className="mt-2 text-2xl font-semibold text-[#8a5f12]">
                      {preview.summary.duplicateRows + preview.summary.existingDuplicateRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-[#d8ded9] bg-white p-4">
                    <p className="text-xs font-medium uppercase text-muted">Targets</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {preview.summary.invalidTargetRows}
                    </p>
                  </div>
                  <div className="rounded-md border border-[#d8ded9] bg-white p-4">
                    <p className="text-xs font-medium uppercase text-muted">Malformed</p>
                    <p className="mt-2 text-2xl font-semibold">{preview.summary.malformedRows}</p>
                  </div>
                </div>

                {preview.fileErrors.length > 0 ? (
                  <div className="rounded-md border border-[#efc5bd] bg-[#fff4f2] px-4 py-3 text-sm text-[#9d2f21]">
                    {preview.fileErrors.map((fileError) => (
                      <p key={fileError}>{fileError}</p>
                    ))}
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-md border border-[#d8ded9] bg-white">
                  <div className="flex items-center justify-between border-b border-[#d8ded9] px-4 py-3">
                    <h2 className="text-sm font-semibold">Preview</h2>
                    <p className="text-sm text-muted">
                      {readyRows} ready, {rejectedRows} rejected
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1120px] divide-y divide-[#e4e9e6] text-left text-sm">
                      <thead className="bg-[#f3f5f1] text-xs uppercase text-muted">
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
                      <tbody className="divide-y divide-[#eef1ee]">
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
              <div className="flex min-h-[520px] items-center justify-center rounded-md border border-dashed border-[#bac6c0] bg-[#fbfbf7] p-8 text-center text-sm text-muted">
                Preview rows will appear here.
              </div>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
