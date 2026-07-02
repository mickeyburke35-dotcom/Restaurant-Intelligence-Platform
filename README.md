# Restaurant Intelligence Platform

Restaurant Intelligence Platform is a multi-tenant B2B SaaS application for hospitality marketing agencies, restaurant consultants, and multi-location restaurant groups. It transforms approved public restaurant review data into AI-assisted sentiment analysis, theme extraction, insights, dashboards, and client-ready reports for teams managing multiple restaurant clients.

---

## Features

- Multi-tenant agency workspaces
- Role-based access control
- Restaurant and client management
- Tenant-scoped review source management
- Approved review import
- AI-assisted sentiment analysis
- Theme extraction
- Insight generation
- Competitor signal tracking
- Dashboard analytics
- Approved insight report snapshots
- PDF/CSV report export planning

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- Node.js

### Database

- PostgreSQL
- Prisma ORM

### Validation

- Zod

### AI

- Google Gemini API for current review summary and insight generation

### Hosting

- Vercel
- Render or Railway

---

## Project Structure

```text
app/
app/api/
components/
lib/
db/
migrations/
jobs/
memory/
tasks/

AGENTS.md
PRD.md
DESIGN.md
tools.md
architecture-checklist.md
README.md
```

The application is planned as one React/Next.js app with API routes and background jobs in the same repository. UI routes live in `app/`, API routes live in `app/api/`, shared logic lives in `lib/`, reusable interface components live in `components/`, Prisma schema and database helpers live in `db/`, migrations live in `migrations/`, and scheduled review or competitor processing lives in `jobs/`.

---

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Installation

```bash
npm install
```

### Environment Variables

All required environment variables are documented in `.env.example`. Keep secrets, API keys, tokens, customer data, and production credentials out of source control.

For the lead capture API:

- `SUPABASE_URL`: Supabase project URL used by the server route.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only key used by `POST /api/demo/leads` to insert into `public.leads`.
- `ZAPIER_LEAD_WEBHOOK_URL`: Server-only Zapier webhook URL notified after a successful lead insert.
- `GOOGLE_AI_API_KEY`: Server-only Google AI key used by review summary and AI insight generation routes.

Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `ZAPIER_LEAD_WEBHOOK_URL`, or `GOOGLE_AI_API_KEY` to client components or `NEXT_PUBLIC_` variables.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

### Tests

```bash
npm test
```

### Prisma

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

---

## Lead Capture API

### `POST /api/demo/leads`

Purpose: captures demo interest and stores the lead in Supabase before notifying Zapier.

Input:

```json
{
  "email": "name@company.com"
}
```

Server behavior:

- Validates the request body with Zod.
- Inserts into `public.leads` with `email` and `source = "restaurant_demo"`.
- After a successful Supabase insert, starts a fire-and-forget server-side POST to `ZAPIER_LEAD_WEBHOOK_URL` with `email`, `source`, and `created_at`.
- Logs Zapier webhook delivery failures only; Zapier outages do not change the lead capture response.
- Uses server-only Supabase and Zapier environment variables.

Response:

- `201`: `{ "ok": true, "message": "Thanks. We will follow up to schedule your demo." }`
- `400`: invalid JSON or invalid email.
- `500`: server configuration or unexpected request failure.
- `502`: Supabase insert failure.

Auth: public demo endpoint. It does not read or modify tenant-scoped restaurant intelligence data.

---

## Review Source APIs

Review source endpoints manage source configuration records only. They do not scrape, call provider APIs, import reviews, create dashboards, or store AI insights.

All routes require an active agency request context. The current route integration expects `x-agency-id` and `x-user-id`, then verifies that the user has an active membership in that agency. `VIEWER` users can read sources but cannot create, edit, or archive them.

### List Review Sources

`GET /api/restaurants/:restaurantId/review-sources`

- Purpose: list review sources for one restaurant, optionally narrowed to one location.
- Query inputs: `locationId` UUID, `includeArchived=true|false`.
- Output: `{ data: ReviewSource[] }`, including the optional location summary.
- Auth: any active agency role with access to the agency context.
- Errors: `400` for invalid route or query input, `401` for missing agency or user context, `403` for invalid membership, `404` when the restaurant is outside the agency.

### Create Review Source

`POST /api/restaurants/:restaurantId/review-sources`

- Purpose: create a source assigned to the restaurant and optionally one of its locations.
- JSON inputs: `name`, `sourceType`, optional `locationId`, `approvalStatus`, `connectionStatus`, `externalAccountId`, `externalLocationId`, and `permissionNotes`.
- Output: `{ data: ReviewSource }`.
- Auth: Owner, Admin, Manager, or Analyst. Viewer is read-only.
- Errors: `400` for invalid input or a location outside the restaurant, `401` for missing agency or user context, `403` for invalid membership or read-only role, `404` when the restaurant is outside the agency, `409` for duplicate provider identifiers.

### Edit Review Source

`PATCH /api/review-sources/:reviewSourceId`

- Purpose: update source metadata, status, provider identifiers, permission notes, or connect/disconnect it from a location by setting `locationId`.
- JSON inputs: any create field as a partial payload. Use `locationId: null` to remove the location link while keeping the restaurant assignment.
- Output: `{ data: ReviewSource }`.
- Auth: Owner, Admin, Manager, or Analyst. Viewer is read-only.
- Errors: `400` for invalid input or a location outside the source restaurant, `401` for missing agency or user context, `403` for invalid membership or read-only role, `404` when the source is outside the agency, `409` for duplicate provider identifiers.

### Archive Review Source

`DELETE /api/review-sources/:reviewSourceId`

- Purpose: soft archive a source and mark it `DISCONNECTED`; the database row remains for auditability.
- Inputs: route `reviewSourceId` UUID.
- Output: `{ data: ReviewSource }` with `deletedAt` set.
- Auth: Owner, Admin, Manager, or Analyst. Viewer is read-only.
- Errors: `400` for invalid route input, `401` for missing agency or user context, `403` for invalid membership or read-only role, `404` when the source is outside the agency or already archived.

---

## AI Insight Generation APIs

AI insight generation uses the existing server-side Google Gemini integration. It only uses explicitly selected imported reviews and stores generated output as draft evidence-linked insight records. It does not generate reports or competitor analysis.

### Generate Draft Insights

`POST /api/insights/generate`

- Purpose: generate one or more draft AI insights from selected imported reviews.
- JSON inputs: `restaurantId`, optional `locationId`, and `reviewIds` array with 1 to 50 review UUIDs.
- Output: `{ data: Insight[] }` with `status = "DRAFT"`, model, prompt version, generated timestamp, confidence when returned, confidence level, source review count, and linked source reviews.
- Auth: Owner, Admin, Manager, or Analyst in the active agency. Viewer is read-only.
- Tenant behavior: every selected review must belong to the active agency, selected restaurant, optional location, and an approved review source.
- Evidence behavior: every stored insight creates `InsightSourceReview` rows for the source reviews Gemini referenced, with excerpts copied from stored review text.
- Errors: `400` for invalid input or selected reviews outside the tenant/restaurant/source scope, `401` for missing context, `403` for read-only roles, `500` for missing `GOOGLE_AI_API_KEY`, and `502` for Gemini failures.

### Review Insight Status

`PATCH /api/insights/:insightId`

- Purpose: apply human review by approving or rejecting an AI insight.
- JSON inputs: `status` as `APPROVED` or `REJECTED`, plus optional `reviewNotes`.
- Output: `{ data: Insight }` with reviewer, review timestamp, approval status, and source evidence.
- Auth: Owner, Admin, Manager, or Analyst in the active agency. Viewer is read-only.
- Approval behavior: only `DRAFT` insights can be approved or rejected. Approved and rejected insights are locked for auditability, and approval requires at least one linked source review.
- Audit behavior: approval and rejection store the reviewer, decision timestamp, status, and optional decision note on the insight record.
- Report behavior: only `APPROVED` insights are eligible for report snapshots. Draft and rejected insights are excluded from report creation.
- Errors: `400` for invalid input, missing source evidence, or attempts to edit a reviewed insight, `401` for missing context, `403` for read-only roles, and `404` when the insight is outside the active agency.

### AI Insight Review Page

`GET /insights`

- Purpose: review generated insight text, confidence, approval status, model metadata, source review count, and supporting review excerpts.
- Users with insight permissions can select approved imported reviews and generate new draft insights from that selected evidence.
- The page displays clear Draft, Approved, and Rejected badges, reviewer details when available, decision timestamps, decision notes, and future report eligibility.
- Viewer users can inspect permitted insight evidence but cannot generate, approve, or reject insights.

---

## Reports APIs

Reports use the existing Prisma `Report` model and store an HTML-ready snapshot in `sections` with the selected filters in `filters`. This slice does not generate PDF or CSV files.

### Create Approved Insight Report

`POST /api/reports`

- Purpose: create a tenant-scoped report snapshot from approved insights only.
- JSON inputs: `restaurantId`, optional `locationId`, `dateRangeStart`, and `dateRangeEnd` in `YYYY-MM-DD` format.
- Output: `{ data: Report }` with `status = "READY"`, `approvedOnly = true`, selected restaurant/location/date filters, approved insight summaries, source review counts, and supporting source metadata.
- Auth: Owner, Admin, Manager, or Analyst in the active agency. Viewer is read-only.
- Tenant behavior: the selected restaurant and optional location must belong to the active agency, and restaurant-scoped memberships can create reports only for their assigned restaurant.
- Insight behavior: only `APPROVED` insights are selected. Draft, rejected, archived, and deleted insights are excluded.
- Evidence behavior: every linked source review for an included insight must match the selected restaurant, optional location, and review publication date range.
- Export behavior: no PDF or CSV file is generated; `fileUrl` and `storageKey` remain empty.
- Errors: `400` for invalid inputs, invalid date order, location mismatch, or no approved insights matching the filters; `401` for missing context; `403` for read-only roles or out-of-scope restaurant access; `404` when the restaurant is outside the active agency.

### Reports Page

`GET /reports`

- Purpose: select a restaurant, optional location, and date range, then create a stored report from approved insight summaries and source counts.
- The page lists recent stored reports with status, selected scope, date range, approved insight count, and source review count.
- Viewer users can inspect stored reports but cannot create new reports.

### Report Detail Page

`GET /reports/:reportId`

- Purpose: show one stored report snapshot with selected filters, overview counts, approved insight summaries, and linked source review evidence.
- Tenant behavior: the report must belong to the active agency, and restaurant-scoped memberships can open only reports for their assigned restaurant.
- Draft and rejected insights are not shown in report details because they are excluded at report creation.

---

## AI Principles

- AI assists users; it does not replace human decision-making.
- AI output must be generated only from collected and approved source data.
- The product must never fabricate reviews, statistics, competitor information, or business claims.
- AI insights must remain traceable to source reviews with supporting evidence.
- Insights should include model, timestamp, confidence, and source references when available.
- High-impact recommendations and client-facing narratives require human review before presentation as business advice.

---

## Development Workflow

Before coding:

- Read `AGENTS.md`.
- Read `README.md` if present.
- Read `memory/MEMORY.md` and `memory/lessons.md`.
- Review the relevant project documentation and source files.
- Update `tasks/todo.md`.
- Write a short implementation plan.

During development:

- Work in small, focused commits.
- Preserve `agency_id` tenant isolation in API routes, Prisma queries, jobs, reports, exports, and AI prompts.
- Do not make architecture changes without approval.
- Do not make authentication or tenant logic changes without approval.
- Do not add dependencies without approval.
- Do not change data collection rules or AI insight behavior without approval.

After every push to GitHub, spawn or run a security-audit subagent before opening or merging a PR. The audit must check the pushed diff for private information, secrets, API keys, database URLs, service-role keys, tokens, personal data, accidental .env commits, generated files, and unrelated coursework artifacts. The audit must report pass/fail, list files checked, list any findings, and recommend immediate remediation before merge.

Post-push security audit checklist:

- Check git diff against origin branch.
- Search for common secrets: `GOOGLE_AI_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `AUTH_SESSION_SECRET`, `github_pat_`, `sk-`, and `AIza`.
- Confirm `.env` is ignored.
- Confirm no screenshots expose secrets.
- Confirm no unrelated Popstop/Videoreport files are committed to the Restaurant Intelligence repo.
- Confirm only intended files changed.

---

## Documentation

- [AGENTS.md](AGENTS.md): Project rules for architecture, tenant isolation, AI behavior, data collection, coding standards, and workflow.
- [PRD.md](PRD.md): Product requirements, MVP scope, screens, backend requirements, testing strategy, risks, and definition of done.
- [DESIGN.md](DESIGN.md): Product design direction for the Scandinavian-inspired B2B SaaS workspace, including layout, components, states, and copy rules.
- [tools.md](tools.md): Technology stack, development commands, engineering standards, testing expectations, hosting, and AI agent context.
- [architecture-checklist.md](architecture-checklist.md): Readiness audit, closed architecture gaps, and build gate checklist for the first implementation slice.
- [memory/MEMORY.md](memory/MEMORY.md): Project memory index for durable corrections and future working context.
- [memory/lessons.md](memory/lessons.md): Durable lessons from prior project work.
- [tasks/todo.md](tasks/todo.md): Current task plan and completed project work log.

---

## License

> This project is developed as part of the MIM AI Challenge coursework.
