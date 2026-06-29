# Architecture

This document summarizes the canonical architecture for the Restaurant Intelligence Platform. The source of truth remains `README.md`, `PRD.md`, `DESIGN.md`, `AGENTS.md`, `tools.md`, `architecture-checklist.md`, `AI_BEHAVIOUR.md`, and `AGENT_BLUEPRINT.md`.

## Frontend Architecture

The product is planned as one React/Next.js application using TypeScript and Tailwind CSS. UI routes live under `app/`, reusable interface components live under `components/`, and shared client/server logic lives under `lib/`.

The interface is a calm, data-led SaaS workspace for agency teams. Primary screens include Sign In, Agency Home, Client Dashboard, Location Detail, Reviews, Insights, Competitors, Reports, and Admin Settings. Dashboards should prioritize KPI summaries, charts, filters, sortable tables, traceable AI insights, and PDF/CSV export controls. Viewer/Client screens remain read-only and must never expose data outside the allowed agency and client scope.

## Backend/API Architecture

Backend code runs on Node.js through Next.js API routes in the same repository. Express is deferred unless a later requirement cannot be handled cleanly by Next.js route handlers or jobs.

API routes should cover authentication callbacks, agency clients, locations, review sources, reviews, AI insights, competitors, reports, exports, and audit logs. Every route must resolve the signed-in user's active agency, role, client scope, and location scope before reading or writing business data. Inputs are validated with Zod or an equivalent schema validator. Errors returned to users must be safe and concise, with server-side details kept in logs.

Exports should be generated server-side and stored privately, with signed download URLs for permitted users.

## Database Architecture

PostgreSQL is the system of record. Prisma is used for schema management, migrations, generated types, typed data access, tenant-aware query helpers, and seed data.

The v1 data model includes agencies, users, agency memberships, restaurant clients, locations, review sources, reviews, competitors, competitor signals, AI insights, reports, and audit logs. Business data tables must include `agency_id` where tenant isolation is required. Raw SQL is allowed only when Prisma cannot express the query clearly, and must be reviewed for parameterization, security, and tenant isolation.

## AI Layer

The OpenAI API supports review summarization, sentiment classification, theme extraction, and draft insight generation from approved collected evidence only.

AI output is assistance for human review, not final authority. The platform must never fabricate reviews, ratings, statistics, market claims, source links, competitor information, or business recommendations. Every generated insight should include source review references, timestamp, model, confidence when available, and human-review status. AI-generated insights are stored separately from source reviews and remain traceable to public source data. Review text and competitor notes are treated as untrusted evidence, not instructions.

## Background Jobs

Scheduled jobs live under `jobs/` and support tenant-scoped review ingestion, approved source syncs, competitor signal collection, deduplication, report workflows, and AI insight refreshes.

Data collection is API-first and compliance-first. Jobs may use official APIs, partner APIs, exports, CSV uploads, or clearly permitted public pages only after source permissions, terms, robots.txt expectations, rate limits, caching, and deduplication rules are documented. Jobs must never collect login-protected content, private messages, contact details, payment data, employee data, sensitive personal information, secrets, customer exports, or unapproved raw data.

## Tenant Isolation

The product uses agency-based multi-tenancy. Each user belongs to one agency for the initial workspace experience, and each agency manages multiple restaurant clients. Roles are Owner/Admin, Manager, Analyst, and Viewer/Client.

Every API route, Prisma query, background job, report, export, and AI prompt must enforce `agency_id` isolation. The application must resolve the signed-in user's active agency and role before business data access. Cross-agency reads, writes, exports, inference paths, and AI prompt payloads must be denied and covered by tests.

## Deployment Assumptions

The frontend is hosted on Vercel. PostgreSQL, scheduled jobs, and backend services that do not fit Vercel runtime limits run on Render or Railway. Secrets for OpenAI, review providers, storage, and database access stay server-side and outside source control.

The first implementation slice starts with seeded demo data and CSV import before live provider integrations. Exports are stored in private storage and delivered through signed URLs.

## Testing Expectations

The definition of done includes TypeScript, ESLint, relevant unit tests, API tests, tenant-scope tests, build verification, and Playwright coverage for major dashboards or user flows when UI is implemented.

Tests should cover tenant filter helpers, role permission checks, review import behavior, API routes, AI prompt builders, sentiment color mapping, insight approval flows, report section selection, PDF/CSV exports, signed file download, and cross-agency denial.
