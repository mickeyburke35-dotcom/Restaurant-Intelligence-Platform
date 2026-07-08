# Session 19 Data Flow

## Inputs

| Input | Notes |
| --- | --- |
| Active request context | Agency, user, role, and any restaurant scope must be present before insight or report actions. |
| `restaurantId` | Required for draft insight generation and report creation. |
| Optional `locationId` | Narrows selected reviews and report scope when provided. |
| Selected `reviewIds` | One to fifty UUIDs for imported review records selected by a permitted user. |
| Approved review source status | Reviews must belong to an approved, non-deleted review source before they can be used for insight generation. |
| Stored review fields | Restaurant, location, source name/type, published date, rating, sentiment, themes, title, and review text. |
| Human review action | `APPROVED` or `REJECTED`, plus optional reviewer notes. |
| Report filters | Restaurant, optional location, and date range. |

## Stored Records

| Record | Written or read | Purpose |
| --- | --- | --- |
| `Review` | Read | Source evidence for selected review insight generation. |
| `ReviewSource` | Read | Confirms the source is approved and inside tenant scope. |
| `Insight` | Written and read | Stores Gemini-generated output as `DRAFT`, then records human review status, reviewer, timestamp, notes, confidence, model, prompt version, and source count. |
| `InsightSourceReview` | Written and read | Links each draft insight to supporting source reviews and stores an evidence excerpt. |
| `AuditLog` | Written | Records generation, approval or rejection, and report creation events. |
| `Report` | Written and read | Stores approved-insight report snapshots with filters, sections, status, generated timestamp, and creator. |

## Outputs

| Output | Source |
| --- | --- |
| Draft insight cards | Gemini output stored as `DRAFT` with evidence links. |
| Human review state | Approval or rejection status, reviewer, timestamp, and notes. |
| Report snapshot | Approved insight summaries, source review counts, sentiment counts, filters, and source metadata. |
| User-safe API errors | Validation, authorization, Gemini, and insufficient-data failures are returned without secrets. |

## Current Boundaries

- AI insight generation does not create competitor analysis or report narratives.
- Reports are built from `APPROVED` insights only.
- The current report slice stores a snapshot; it does not generate an exported PDF or CSV file.
- No live provider collection is claimed by this Session 19 evidence.
