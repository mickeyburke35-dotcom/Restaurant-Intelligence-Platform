# Sprint Todo

## Current Work

- No active sprint task captured yet.

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
