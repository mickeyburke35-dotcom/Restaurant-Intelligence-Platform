# Sprint Todo

## Current Work

- No active sprint task captured yet.

## Demo Hub Page Plan

1. Add `app/demo/page.tsx` as a static navigation hub using existing Tailwind theme tokens and no business logic.
2. Include the requested title, subtitle, six demo cards, short descriptions, and `Open` buttons to existing routes.
3. Document `/demo` in `README.md`, then verify with `npm run lint`, `npm run typecheck`, and `npm run build`.

## AI Insight Generation Resilience Plan

1. Inspect the Gemini helper and insight generation model metadata flow without changing tenant checks or Prisma schema.
2. Add a stable fallback model retry only for transient 5xx/high-demand Gemini responses during insight generation.
3. Store the actual model that successfully generated draft insights and preserve the existing friendly UI error when both attempts fail.
4. Update README documentation and verify `npm run lint`, `npm run typecheck`, and `npm run build`.

## AI Insight Generation Insert Fix Plan

1. Inspect the checked-in `Insight` and `InsightSourceReview` Prisma models and the current `tx.insight.create()` write shape.
2. Replace scalar relation field writes in the insight create call with Prisma relation `connect` writes that preserve active-agency, restaurant, location, creator, and source-review evidence links.
3. Confirm the AI Insight Review page still exposes Approve and Reject actions for manageable draft insights.
4. Verify with `npm run lint`, `npm run typecheck`, and `npm run build`.

## Reports Implementation Plan

1. Add a tenant-scoped report service using the existing Prisma `Report` model, selecting only approved insights for the chosen restaurant, optional location, and review publication date range.
2. Add a Zod-validated report creation API route that stores approved insight summaries, source counts, filters, and supporting source metadata in the report JSON sections without adding PDF export or competitor data.
3. Add `/reports` and `/reports/[reportId]` pages with restaurant, location, and date range controls, a report list, creation flow, and read-only detail view.
4. Update README documentation and verify `npm run lint`, `npm run typecheck`, and `npm run build`.

## Human Approval Workflow Polish Plan

1. Improve the `/insights` review UI with clearer Draft, Approved, and Rejected status badges, approval/rejection timestamps, reviewer display, and report-eligibility guidance.
2. Add an audit-style decision panel and note field for approval or rejection without adding report, competitor, AI behavior, or schema changes.
3. Lock reviewed insights against accidental follow-up edits in the UI and API while preserving tenant-scoped review handling.
4. Update README documentation and verify `npm run lint`, `npm run typecheck`, and `npm run build`.

## AI Insight Generation Plan

1. Add missing shared API/context helper exports required by the existing review-source and review-import routes without changing the tenant model.
2. Add a tenant-scoped insight service that selects only requested imported reviews, calls the existing Gemini integration, stores draft `Insight` records, and creates `InsightSourceReview` evidence links for every source review used.
3. Add Zod-validated API routes for draft generation and human approval/rejection while keeping all generated insights in `DRAFT` until explicitly approved.
4. Add an AI Insight Review page that lists draft/approved insights with text, confidence, status, source review count, model metadata, and supporting review excerpts.
5. Update README API/UI documentation and verify lint, typecheck, and build.

## Zapier Lead Notification Plan

1. Add the Session 16 lead capture API route with server-side email validation and the existing Supabase lead insert behavior.
2. Read `ZAPIER_LEAD_WEBHOOK_URL` from the server environment and fire a non-blocking webhook POST only after Supabase accepts the lead.
3. Log webhook delivery failures without exposing secrets or changing the lead capture response.
4. Update `.env.example`, README API notes, and verify lint, typecheck, and build.

## GitHub Push Security Review Workflow Plan

1. Add the post-push security-audit rule to `AGENTS.md` under Workflow.
2. Add the same workflow rule and checklist to the README development workflow because it documents workflow rules.
3. Keep the change documentation-only: no application code, dependencies, destructive commands, or unrelated edits.
4. Re-read the changed sections and record completion notes.

## Review Sources Implementation Plan

1. Add tenant-scoped review source service functions for list, create, edit, and soft archive/disconnect using the existing Prisma `ReviewSource` model.
2. Add Zod-validated Next.js API routes for restaurant-scoped list/create and source-scoped edit/archive actions.
3. Keep behavior limited to source configuration records: no scraping, external provider calls, review import, dashboards, or AI insight storage.
4. Update README API documentation and record completion notes after lint, typecheck, and build verification.

## Prisma Initial Migration Plan

1. Use the documented `.env.example` `DATABASE_URL` for all Prisma commands.
2. Run `npx prisma validate`, then `npx prisma generate`, then `npx prisma migrate dev --name init`.
3. Stop and document local PostgreSQL setup if the configured database is not available, without changing architecture or unrelated files.
4. Record the completed migration outcome in this todo file.

## Prisma Data Model Plan

1. Model the v1 agency-scoped entities in `prisma/schema.prisma` only, using UUID primary keys, timestamps, foreign keys, enums, and indexes.
2. Preserve tenant isolation with mapped `agency_id` columns on every business-data model and evidence link.
3. Store AI insights separately from raw reviews, require source-review traceability, and include human approval status fields.
4. Validate the Prisma schema without writing migrations, then record completion notes.

## Initial Application Scaffold Plan

1. Create the requested Next.js App Router directory structure and placeholder files for empty project areas.
2. Add TypeScript, Tailwind CSS, ESLint, Prisma, PostgreSQL, and Zod configuration without business features.
3. Verify the scaffold with install, lint, typecheck, Prisma generation, and build when the local environment allows, then record completion notes.

## Session 12 Canonical Repository Structure Plan

1. Use the existing project documents as source of truth for the missing canonical repository docs.
2. Create `ARCHITECTURE.md`, `SUBMISSION.md`, and placeholder files for `src/`, `public/`, and `evidence/`.
3. Verify only the requested files were added or updated, then record a completion note.

## Managed Agent Blueprint Plan

1. Use `AGENTS.md`, `PRD.md`, `DESIGN.md`, `tools.md`, and `AI_BEHAVIOUR.md` as the source of truth.
2. Create `AGENT_BLUEPRINT.md` for the Review Insight Analyst Agent using the requested managed-agent structure.
3. Verify the blueprint stays concise, evidence-led, and free of invented review data, metrics, market claims, or competitor information.

## AI Behaviour Specification Plan

1. Document the requested Review Insight Generation behavior using the provided section structure.
2. Keep the specification aligned with source-linked AI output, confidence labeling, and human approval rules.
3. Add a completion note after verifying the new file and todo update.

## Documentation Consistency Review Plan

1. Compare the requested docs for contradictory requirements, duplicated rules, naming drift, folder structure drift, AI principle drift, terminology drift, and outdated references.
2. Make only minimal edits that align the docs with the established Next.js, Prisma, PostgreSQL, agency-tenant, and human-reviewed AI direction.
3. Re-read changed sections and summarize consistency fixes.

## README Documentation Plan

1. Use `AGENTS.md`, `PRD.md`, `DESIGN.md`, `tools.md`, and `architecture-checklist.md` as the source of truth.
2. Draft the README with the requested structure, documented MVP scope, stack, commands, AI principles, workflow, and documentation links.
3. Review the Markdown for concise B2B SaaS tone, no unsupported functionality, and consistency with project terminology.

## Tools Documentation Plan

1. Use `AGENTS.md`, `PRD.md`, `DESIGN.md`, `architecture-checklist.md`, and `README.md` if present as the source of truth.
2. Replace the stale root `tools.md` deliverable content with the requested tools and standards reference.
3. Review the Markdown for concise wording, project terminology, and consistency with tenant, AI, and data collection rules.

## Document Generation Plan

1. Inspect the Word template structure and preserve its section order, tables, and formatting style.
2. Draft all 13 required PRD sections from existing project material without unsupported statistics or market claims.
3. Generate the `.docx`, render it for visual QA, and revise if layout issues appear.

## Implementation Plan

1. Preserve the Scandinavian-inspired calm analyst workspace direction while making the visual point of view more specific.
2. Strengthen layout, typography, palette, motion, component, accessibility, and quality-gate rules for dashboard and reporting screens.
3. Add explicit anti-patterns against generic AI dashboard design, glassmorphism, purple gradients, restaurant-themed visuals, and banned marketing buzzwords.
4. Review the revised spec for concise Lovable usability and consistency with `AGENTS.md` and `PRD.md`.

## Blocked

- 2026-06-29: Initial Prisma migration is blocked because local PostgreSQL is not reachable at the documented `.env.example` URL. `npx prisma validate` and `npx prisma generate` passed with the documented `DATABASE_URL`; `npx prisma migrate dev --name init` failed before creating a migration, and a localhost port check found no listener on port 5432.

## Completed

- 2026-07-03: Implemented the Demo Hub page only at `/demo` with six static navigation cards for Restaurants, Locations, Reviews, AI Insights, Reports, and Authentication. Used existing Tailwind theme tokens, linked only to existing routes, added no business logic or dependencies, updated README documentation, and verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-07-03: Created Session 19 / Deliverable 3 documentation only: demo script, action plan, workflow diagram, agent design, data flow, memory/logging, and risk controls under `evidence/`. Updated this completion note only; no application code, dependencies, schema, auth, tenant logic, data collection behavior, or AI insight behavior was changed.
- 2026-07-02: Fixed AI insight generation resilience only: kept `gemini-3.5-flash` as the primary configured model, added one retry with stable fallback `gemini-3.1-flash-lite` for transient 5xx/high-demand responses, stored the successful model on draft insights, preserved tenant-scoped review validation and existing friendly `502` UI error behavior, and updated README. Verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-07-02: Fixed the AI Insight Generation Prisma insert bug without changing the schema or Gemini logic by switching the draft insight create path from scalar relation IDs to Prisma relation connects for agency, restaurant, location, creator, and source-review evidence. Tenant-scoped review validation remains before insert. Verified `npm run lint`, `npm run typecheck`, `npm run build`, and a rollback-only Prisma runtime create probe.
- 2026-07-02: Implemented Reports only: added a tenant-scoped report service and `POST /api/reports`, created stored report snapshots from `APPROVED` insights only, enforced restaurant/location/date-range scope across linked source reviews, stored filters and approved insight summaries/source counts in the existing Prisma `Report` model without a schema migration, added `/reports` and `/reports/[reportId]`, and updated README. Verified `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` placeholder output, and local route smoke checks for `/reports` and `/reports/not-a-uuid`.
- 2026-07-02: Polished the Human Approval Workflow only: improved `/insights` status badges for Draft, Approved, and Rejected states; added decision timestamp, reviewer, audit note, and future-report eligibility display; locked reviewed insights from follow-up approval edits in the UI and API without changing Prisma schema; updated README. Verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-07-02: Implemented AI Insight Generation only: added Gemini-backed draft insight generation from selected tenant-scoped imported reviews, stored `Insight` records as `DRAFT` with model, prompt version, timestamp, confidence, source review count, and `InsightSourceReview` evidence links; added human approval/rejection API flow and `/insights` review page with supporting excerpts. Updated README; verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-07-02: Applied the lead notification webhook to the current branch with `POST /api/demo/leads`, server-side Supabase lead insertion, `ZAPIER_LEAD_WEBHOOK_URL` configuration, and fire-and-forget Zapier delivery containing `email`, `source`, and `created_at`; webhook failures are logged without failing lead capture. Updated README and `.env.example`; verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-07-01: Added the post-GitHub-push security-audit workflow rule and checklist to `AGENTS.md` and `README.md`, including required pass/fail reporting, files checked, findings, remediation guidance, secret search terms, `.env` checks, screenshot checks, Popstop/Videoreport artifact checks, and intended-file confirmation. No application code or dependencies were changed.
- 2026-07-01: Implemented Review Sources only: tenant-scoped list/create/edit/soft archive API routes and service layer using the existing Prisma schema, Zod validation, restaurant/location ownership checks, and no scraping, external API calls, review import, dashboards, or AI insight storage. Verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-06-29: Implemented the complete Prisma data model for the Restaurant Intelligence Platform with agency-scoped UUID models, role enums, review/source/insight traceability, human approval workflow fields, competitor observations, reports, scheduled jobs, audit logs, soft-delete fields where useful, indexes, and validated schema formatting without writing migrations.
- 2026-06-29: Created the initial Next.js App Router foundation with TypeScript, Tailwind CSS, Prisma/PostgreSQL schema configuration, Zod dependency, ESLint flat config, environment example, requested project directories, and a minimal buildable app shell; verified `npm run prisma:generate`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- 2026-06-29: Created the Session 12 canonical repository structure with `ARCHITECTURE.md`, `SUBMISSION.md`, `src/.gitkeep`, `public/.gitkeep`, and `evidence/.gitkeep`; recorded the GitHub suspension submission status and verified no unrelated files were modified.
- 2026-06-29: Created `AGENT_BLUEPRINT.md` for the Review Insight Analyst Agent managed blueprint, covering purpose, managed-agent instructions, Review Insight Generation capability, tool permissions, allowed sources, closed network policy, output requirements, and approval gates.
- 2026-06-29: Created `AI_BEHAVIOUR.md` documenting Review Insight Generation behavior, including trigger, inputs, AI processing, draft insight card outputs, backend service location, success criteria, and Session 11 Stitch PNG design evidence.
- 2026-06-26: Reviewed project documentation for consistency and aligned README, PRD, DESIGN, and tools wording for structure, workflow, AI review, tenant context, and background jobs.
- 2026-06-26: Created a concise professional `README.md` for the Restaurant Intelligence Platform from `AGENTS.md`, `PRD.md`, `DESIGN.md`, `tools.md`, and `architecture-checklist.md`.
- 2026-06-26: Replaced root `tools.md` with a concise project tools reference covering the stack, AI services, tenant model, jobs, hosting, commands, testing, data collection rules, coding standards, and AI agent context.
- 2026-06-26: Lightly revised `PRD_RestaurantIntelligencePlatform_v1.docx` with a Primary MVP hypothesis, end-to-end success metric, stronger human-review language for AI insights, and a clean 7-page render preview.
- 2026-06-26: Created `PRD_RestaurantIntelligencePlatform_v1.docx` from `PRD_TEMPLATE.docx` using available project files, then rendered and reviewed the 7-page DOCX. `PROJECT_PROGRESS.md` was requested but was not present in the workspace or nearby searched directories.
- 2026-06-26: Improved `DESIGN.md` into a concise Lovable-ready product design spec with stronger visual direction, component standards, layout rules, motion guidance, quality gates, and anti-patterns.
- 2026-06-26: Completed Run Loop L01 readiness audit on `PRD.md`, rewrote the weakest platform architecture section, and created `architecture-checklist.md`.
- 2026-06-26: Created root-level `skill.md` for the `review-insight-brief` reusable skill.
- 2026-06-26: Designed the Session 9 `Review Insight Analyst Agent` deliverable in `tools.md`.
- 2026-06-26: Set up persistent project memory files and index.
