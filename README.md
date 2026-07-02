# Restaurant Intelligence Platform

Restaurant Intelligence Platform is a multi-tenant B2B SaaS application for hospitality marketing agencies, restaurant consultants, and multi-location restaurant groups. It transforms approved public restaurant review data into AI-assisted sentiment analysis, theme extraction, insights, dashboards, and client-ready reports for teams managing multiple restaurant clients.

---

## Features

- Multi-tenant agency workspaces
- Role-based access control
- Restaurant and client management
- Tenant-scoped review source management
- Approved review import
- Read-only review dashboard with search, filters, sorting, pagination, and detail view
- AI-assisted sentiment analysis
- Theme extraction
- Insight generation
- Competitor signal tracking
- Dashboard analytics
- PDF/CSV report export

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

- OpenAI API
- Google AI Studio / Gemini for the first review-summary test endpoint

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

`GOOGLE_AI_API_KEY` is used server-side by the Gemini review-summary endpoint. Do not prefix it with `NEXT_PUBLIC_`, and do not expose it to browser code.

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

## Review Dashboard

The read-only Review Dashboard is available at `/reviews`. It uses the same active agency request context as the API layer and only reads tenant-scoped review data from the existing Prisma models.

The dashboard supports:

- Review list/table
- Search across review title, text, external ID, restaurant, location, and source name
- Filters by restaurant, location, source, rating, sentiment, and published date range
- Sorting by published date, rating, sentiment, restaurant, location, source, and collected date
- Pagination with configurable page size
- Review detail view with full review text, source, timestamps, trace fields, rating, sentiment, score, language, themes, and source review link when available

This dashboard does not generate AI output, create reports, import reviews, collect new data, or show competitor features.

---

## Review APIs

Review endpoints are read-only dashboard endpoints. They do not create, edit, import, enrich, summarize, export, or collect reviews.

All routes require an active agency request context. The current route integration expects `x-agency-id` and `x-user-id`, then verifies that the user has an active membership in that agency. Every query is scoped by `agency_id` and excludes soft-deleted reviews.

### List Reviews

`GET /api/reviews`

- Purpose: list tenant-scoped reviews for the dashboard with filters, sorting, pagination, summary metrics, and filter options.
- Query inputs: `search`, `restaurantId` UUID, `locationId` UUID, `reviewSourceId` UUID, `rating` from `1` to `5`, `sentiment`, `dateFrom` and `dateTo` as `YYYY-MM-DD`, `sortBy`, `sortDirection=asc|desc`, `page`, and `pageSize`.
- Supported `sortBy` values: `publishedAt`, `rating`, `sentiment`, `restaurant`, `location`, `source`, and `collectedAt`.
- Output: `{ data, pagination, summary, filters }`, where `summary` includes total reviews, average rating, and sentiment counts.
- Auth: any active agency role with access to the agency context.
- Errors: `400` for invalid query input, `401` for missing agency or user context, and `403` for invalid membership.

### Get Review Detail

`GET /api/reviews/:reviewId`

- Purpose: fetch one tenant-scoped review for the dashboard detail view.
- Inputs: route `reviewId` UUID.
- Output: `{ data: Review }`, including restaurant, location, and review source summaries.
- Auth: any active agency role with access to the agency context.
- Errors: `400` for invalid route input, `401` for missing agency or user context, `403` for invalid membership, and `404` when the review is outside the agency or soft-deleted.

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

## AI Principles

- AI assists users; it does not replace human decision-making.
- AI output must be generated only from collected and approved source data.
- The product must never fabricate reviews, statistics, competitor information, or business claims.
- AI insights must remain traceable to source reviews with supporting evidence.
- Insights should include model, timestamp, confidence, and source references when available.
- High-impact recommendations and client-facing narratives require human review before presentation as business advice.

---

## AI Review Summary Endpoint

`POST /api/ai/review-summary` generates a draft review summary using Google AI Studio / Gemini.

- Purpose: summarize fictional restaurant review text, classify sentiment, and identify key themes for local testing.
- Request body: `{ "reviewText": "..." }`
- Response body: `{ "summary": "...", "sentiment": "positive|neutral|negative|mixed|unknown", "keyThemes": ["..."] }`
- Auth requirements: none yet; this endpoint does not read or write tenant data and must only be used with fictional review text until auth and approved-source flows are added.
- Error cases: invalid JSON, empty review text, missing `GOOGLE_AI_API_KEY`, Gemini API failure, or invalid AI output shape.
- Persistence: AI output is validated and returned to the caller, but it is not saved to the database.

Test UI: run `npm run dev` and open `/ai/review-summary`.

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
