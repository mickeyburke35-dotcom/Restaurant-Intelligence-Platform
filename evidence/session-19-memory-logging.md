# Session 19 Memory And Logging

## Reads

The workflow reads:

- Active agency and user context for tenant and role scope.
- Restaurant and optional location scope.
- Selected imported review records.
- Review source approval status.
- Review text, title, rating, sentiment, themes, source type, source name, location, restaurant, and published date.
- Existing insights, source-review links, and reports for review and detail pages.
- Server-only `GOOGLE_AI_API_KEY` for Gemini requests.

## Writes

The workflow writes:

- `Insight` records with `DRAFT`, `APPROVED`, or `REJECTED` status.
- `InsightSourceReview` records linking each stored insight to supporting reviews.
- Evidence excerpts copied from stored review evidence.
- Reviewer ID, review timestamp, and optional decision notes.
- `AuditLog` records for insight generation, approval, rejection, and report creation.
- `Report` records containing filters and approved-insight snapshot sections.

## AI Request Memory

Gemini receives selected review evidence for the generation request. The request body uses `store: false` in the current Gemini helper. The system should still treat transmitted review evidence as sensitive operational data and send only the selected records required for the task.

## Logging

- Gemini insight failures are logged server-side with a user-safe error response.
- Audit logs store event metadata such as model, prompt version, selected review IDs, source review count, status, and report filters.
- Reviewer notes are stored with the reviewed insight.
- API responses should not expose server secrets, API keys, raw environment values, or stack traces.

## What It Does Not Write

- It does not write approved reports from draft or rejected insights.
- It does not write live competitor findings during Gemini insight generation.
- It does not write client-facing advice without a human approval state.
- It does not store API keys or environment values in insight, report, or audit records.
