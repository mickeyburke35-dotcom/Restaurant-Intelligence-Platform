# Restaurant Intelligence Platform

Restaurant Intelligence Platform is a multi-tenant B2B SaaS application for hospitality marketing agencies, restaurant consultants, and multi-location restaurant groups. It transforms approved public restaurant review data into AI-assisted sentiment analysis, theme extraction, insights, dashboards, and client-ready reports for teams managing multiple restaurant clients.

---

## Features

- Multi-tenant agency workspaces
- Role-based access control
- Restaurant and client management
- Restaurant location management
- Approved review import
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

## Restaurant API Routes

Restaurant CRUD is implemented with agency-scoped Next.js route handlers:

- `GET /api/restaurants`: lists restaurants for the signed-in user agency. Query parameters: `q` and `status` (`ALL`, `ACTIVE`, `PAUSED`, or `ARCHIVED`).
- `POST /api/restaurants`: creates one restaurant. Body fields: `name`, `segment`, `cuisine`, `websiteUrl`, `notes`, and `status`.
- `GET /api/restaurants/:id`: returns one non-archived restaurant only when it belongs to the active agency.
- `PATCH /api/restaurants/:id`: updates one non-archived restaurant with the same fields used by create.
- `DELETE /api/restaurants/:id`: archives one restaurant by setting `status` to `ARCHIVED` and `deletedAt` to the current timestamp.

All routes resolve an active agency membership before accessing restaurant data, validate input with Zod, and return user-safe `400`, `401`, `403`, `404`, `409`, or `500` errors. Local development may use `RESTAURANT_INTELLIGENCE_USER_EMAIL` or `RESTAURANT_INTELLIGENCE_USER_ID` to select a seeded user; non-production requests without an identity fall back to the first active manager-level membership.

---

## Location API Routes

Location CRUD is implemented as restaurant-scoped Next.js route handlers:

- `GET /api/restaurants/:id/locations`: lists locations for one restaurant in the signed-in user agency. Query parameters: `q` and `status` (`ALL`, `ACTIVE`, `PAUSED`, `CLOSED`, or `ARCHIVED`).
- `POST /api/restaurants/:id/locations`: creates one location under the restaurant. Body fields: `name`, `addressLine1`, `addressLine2`, `city`, `region`, `postalCode`, `country`, `timezone`, `latitude`, `longitude`, and `status`.
- `GET /api/restaurants/:id/locations/:locationId`: returns one non-archived location only when it belongs to the active agency and restaurant.
- `PATCH /api/restaurants/:id/locations/:locationId`: updates one non-archived location with the same fields used by create.
- `DELETE /api/restaurants/:id/locations/:locationId`: archives one location by setting `status` to `ARCHIVED` and `deletedAt` to the current timestamp.

All location routes reuse the active agency membership and role checks from restaurant management. Every query is scoped by `agency_id` and `restaurant_id`, and manager-only mutations use the existing restaurant permission rules. Location inputs are validated with Zod and use the shared API error response helper.

---

## Review Import APIs

Review import endpoints parse CSV uploads, validate review rows, preview ready and rejected rows, and store approved public reviews in the existing `reviews` table. They do not call external providers, scrape websites, generate AI output, or create dashboards.

All import routes require `x-agency-id` and `x-user-id`. The user must have an active Owner, Admin, Manager, or Analyst membership in the agency. The selected restaurant, location, and review source must belong to that agency, and the review source must have `approvalStatus: APPROVED`.

### CSV Columns

Required columns:

- `external_review_id`: provider/export review identifier used for duplicate prevention.
- `published_at`: public review publication date.

Optional columns:

- `rating`: numeric rating from 1 to 5.
- `title`
- `text`
- `language`
- `author_display_name_hash`: hashed display name only; raw names and contact fields are rejected.
- `review_url`
- `approved_public`: when present, must be true.

Supported aliases include `external_id`, `review_id`, `provider_review_id`, `review_date`, `published_date`, `review_text`, `url`, and `source_url`. Unsupported columns and private/contact columns such as author name, email, phone, customer ID, or customer name are rejected.

### Preview Review Import

`POST /api/reviews/import/preview`

- Purpose: parse CSV text and return row-level import readiness before storing reviews.
- JSON inputs: `restaurantId`, `locationId`, `reviewSourceId`, `csvText`, and `approvedPublicData: true`.
- Output: `{ data: { summary, fileErrors, rows } }`, where rows are marked `READY` or `REJECTED` with reasons.
- Duplicate handling: rows are rejected when their external review ID repeats in the CSV or already exists for the same agency and review source.
- Auth: Owner, Admin, Manager, or Analyst.
- Errors: `400` for invalid request input, unapproved source, location/source mismatch, malformed request JSON, or invalid IDs; `401` for missing request context; `403` for invalid membership or read-only role; `404` when the restaurant or review source is outside the agency.

### Confirm Review Import

`POST /api/reviews/import/confirm`

- Purpose: rerun the same validation and insert only rows that are still ready.
- JSON inputs: same as preview.
- Output: `{ data: { importedCount, preview } }`.
- Storage: creates tenant-scoped `Review` records linked to `agencyId`, `restaurantId`, `locationId`, and `reviewSourceId`; stores source payload hashes and CSV import metadata.
- Duplicate handling: uses external review ID plus review source within the agency; database inserts use duplicate skipping as an additional guard.
- Auth: Owner, Admin, Manager, or Analyst.
- Errors: same as preview.

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
