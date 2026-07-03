# Session 19 Risk Controls

## Gemini Failure

- Missing `GOOGLE_AI_API_KEY` returns a user-safe configuration error.
- Gemini generation failures return a user-safe "Draft insights could not be generated right now" response.
- Transient Gemini 5xx, high-demand, overloaded, or temporarily unavailable responses are retried once with the configured fallback model.
- If Gemini fails, the workflow should not create a polished insight or report from that failed response.
- Server logs should avoid exposing API keys or environment values.

## Low Confidence

- The prompt tells Gemini to mark sparse evidence as `LOW` confidence or return no insights.
- Confidence and confidence level are stored on the draft insight when available.
- Low-confidence output remains draft-only until a permitted human reviewer approves or rejects it.
- High-impact recommendations remain subject to human review.

## Missing Evidence

- Selected review IDs are validated against the active agency, selected restaurant, optional location, and approved source status.
- Gemini may reference only selected review IDs.
- If the AI response references an unselected review ID, the flow rejects the response.
- Drafts without source review links are not stored as usable insights.
- Approval requires at least one linked source review.

## Draft And Rejected Insight Exclusion

- Report creation selects only `APPROVED` insights.
- Draft, rejected, archived, deleted, and zero-source insights are excluded from report snapshots.
- Approved and rejected insights are locked against follow-up status edits for auditability.

## Human Gate

- AI output is stored as `DRAFT` first.
- A permitted human reviewer must approve or reject the draft.
- The review decision stores reviewer, timestamp, status, and optional notes.
- Client-facing report snapshots use approved insights only.

## Tenant And Role Scope

- Insight generation and report creation require active agency context.
- Selected reviews, source links, insights, and reports are scoped by `agencyId`.
- Viewer users can inspect permitted data but cannot generate insights, approve or reject insights, or create reports.
