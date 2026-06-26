# Tools

## Purpose

This document defines the technologies, services, development tools, workflows, and engineering standards used by the Restaurant Intelligence Platform. It is a reference for developers and AI coding agents working in this project.

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

The frontend is a clean, responsive, WCAG-friendly SaaS workspace for agency teams. Product screens should prioritize actionable insights, clear tenant context, dense tables, labeled charts, filters, export controls, and traceable AI outputs.

## Backend

- Next.js API Routes
- Node.js

Backend code runs through Next.js API routes in the same repo as the frontend. API routes must enforce tenant scope, validate inputs, return user-safe errors, and keep server-side details in logs.

## Database

- PostgreSQL
- Prisma ORM

PostgreSQL is the system of record. Prisma is used for schema management, migrations, generated types, tenant-aware query helpers, and typed data access. Business data tables must include `agency_id` where tenant isolation is required.

## Validation

- Zod

Use Zod for form and API payload validation. Invalid inputs should produce clear user-safe errors.

## AI

- OpenAI API
- Review summarization
- Sentiment analysis
- Theme extraction
- Insight generation

The OpenAI API is used to summarize collected review evidence, classify sentiment, extract recurring themes, and draft concise insights for dashboards and reports.

AI is an assistant, not an authority. Never fabricate reviews, statistics, competitor information, or insights. If evidence is limited, stale, conflicting, or low confidence, the product must say so.

Every AI insight must include source references, timestamp, model, and confidence when available. AI-generated insights must be stored separately from source reviews and remain traceable to approved public source data.

High-impact recommendations and client-facing narratives require human review before presentation as business advice.

## Authentication

The product uses an agency-based multi-tenant architecture. Each user belongs to one agency, and agencies manage multiple restaurant clients. All business data access must be isolated by `agency_id`.

Every API route, Prisma query, job, report, export, and AI prompt must resolve and enforce the signed-in user's active agency, role, client scope, and location scope before reading or writing business data.

Roles:

- Owner/Admin: manages billing, users, clients, settings, source configuration, and agency administration.
- Manager: manages dashboards, reports, insights, approvals, and client-ready outputs.
- Analyst: views, investigates, edits, and supports insights and reports.
- Viewer/Client: has read-only dashboard and report access for permitted client views.

## Background Jobs

Scheduled jobs run in `jobs/` and support tenant-scoped processing for approved data sources and report workflows.

Scheduled processing includes:

- Review ingestion
- Approved source syncs
- Competitor signal collection
- Deduplication
- AI insight refreshes

Jobs must use approved APIs, partner APIs, exports, CSV uploads, or clearly permitted public pages only. Jobs must respect source terms, robots.txt, rate limits, caching, deduplication, and `agency_id` isolation.

## Hosting

- Vercel
- Render or Railway

Host the frontend on Vercel. Use Render or Railway for PostgreSQL, scheduled jobs, and backend services that cannot run reliably within Vercel limits.

## Development Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx prisma generate`
- `npx prisma migrate dev`
- `npx prisma studio`

## Testing

- TypeScript
- ESLint
- Unit tests
- API tests
- Playwright for major user flows

Tests should cover tenant-scope helpers, role permissions, review import behavior, API routes, AI prompt builders, insight approval flows, report exports, and cross-agency denial. Major dashboard and client-facing flows should have Playwright coverage.

## Data Collection Rules

Data collection is API-first and compliance-first.

- Use official APIs, partner APIs, exports, CSV uploads, or clearly permitted public pages.
- Respect robots.txt, site terms, and rate limits.
- Collect only approved public data.
- Never collect login-protected content, private messages, contact details, payment data, employee data, sensitive personal information, secrets, customer exports, or unapproved raw data.
- Use conservative scheduling, caching, and deduplication.
- Document provider permissions before live source collection.

## Coding Standards

- Use TypeScript strict mode.
- Avoid `any` unless justified.
- Validate API inputs with Zod.
- Use Prisma for typed database access and migrations.
- Use PostgreSQL as the system of record.
- Enforce `agency_id` tenant isolation in API routes, Prisma queries, jobs, reports, exports, and AI prompts.
- Never commit secrets, API keys, tokens, production credentials, customer data, or private datasets.
- Keep `.env.example` updated when environment variables change.
- Update `README.md` when setup, commands, environment variables, or architecture change.
- Return user-safe errors and log server-side details.
- Comment complex logic only.

## AI Agent Context

AI coding agents should read the following before making significant changes:

1. AGENTS.md
2. README.md if present
3. memory/MEMORY.md
4. memory/lessons.md
5. tasks/todo.md
6. Relevant project documentation and source files
