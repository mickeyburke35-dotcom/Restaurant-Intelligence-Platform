# Sprint Todo

## Current Work

- 2026-06-30: Update today's checklist from current repository evidence only.

## Static Landing Page Implementation Plan

1. Use `PRD.md`, `DESIGN.md`, `README.md`, `AGENTS.md`, and the copywriting skill for positioning, visual direction, and copy constraints.
2. Add a new static marketing route at `app/landing/page.tsx` without replacing the existing app shell or changing architecture.
3. Build the required sections: hero, problem, product workflow, AI trust, target users, CTA, and footer using the documented Scandinavian B2B SaaS palette and concrete evidence-led copy.
4. Avoid banned language, restaurant-themed clichés, purple gradients, glassmorphism, invented statistics, unsupported claims, and architecture changes.
5. Verify with `npm run lint`, `npm run typecheck`, and `npm run build`, then record completion notes.

## Today's Checklist Update Plan

1. Use repository files, installed skill folders, Git remote configuration, and Git history as the source of truth.
2. Mark items complete only when there is clear local evidence.
3. Leave account administration, contributor invites, uploads, domain setup, and unverified summary items unchecked.

## Today's Checklist - 2026-06-30

- [x] Finalise `ARCHITECTURE.md` (file exists and documents the canonical architecture).
- [x] Finalise at least one specialist agent for my project (`AGENT_BLUEPRINT.md` exists for the Review Insight Analyst Agent).
- [x] Install Copywriting skill (`.agents/skills/copywriting/SKILL.md` exists).
- [x] Create account on GitHub (`SUBMISSION.md` records restored GitHub access for `mickeyburke35-dotcom`; Git remote uses that owner).
- [x] Create a project repo (`origin` points to `https://github.com/mickeyburke35-dotcom/Restaurant-Intelligence-Platform.git`).
- [ ] Add all team members as contributors (not verified from local repository state).
- [ ] Add professor as contributor (`SUBMISSION.md` says the invite is not verified as sent).
- [x] Create `README.md`.
- [x] Connect GitHub to Codex (`SUBMISSION.md` records Codex connected; referenced screenshot is not present under `evidence/`).
- [x] One team member commits `ARCHITECTURE.md` (Git history shows commit `30f9789`).
- [ ] A different team member commits the specialist agent `.md` (not verified as a different contributor from local Git history).
- [x] Generate static landing page (`app/page.tsx` provides the current static app shell).
- [ ] Upload files to Google AI Studio (not verified from local repository state).
- [ ] Upload files to at least one other tool (not verified from local repository state).
- [ ] Get a domain for the project (not verified from local repository state).
- [ ] Get a GitHub summary (no explicit GitHub summary artifact found).

## Codex Architecture Review Evidence Plan

1. Create `evidence/codex-architecture-review.md` summarizing Questions 1-4 from the repository architecture review.
2. Keep the work documentation-only: no app code, API routes, schema edits, dependencies, or runtime configuration changes.
3. Record completion after verifying the new evidence file and todo update.

## Reliability And Evaluation Documentation Plan

1. Use `PRD.md`, `AI_BEHAVIOUR.md`, `AGENT_BLUEPRINT.md`, `ARCHITECTURE.md`, and `prisma/schema.prisma` as source of truth.
2. Create `RELIABILITY_CHECKLIST.md`, `PRODUCT_EVALUATION.md`, and `ONBOARDING_FRICTION_REPORT.md` in the project root only.
3. Keep the work documentation-only: no app features, API routes, schema edits, dependencies, or unrelated files.
4. Record completion after verifying the requested files and todo update.

## Session 12 Agent Team Handoff Plan

1. Create `AGENT_TEAM_HANDOFF.md` as a design-only course exercise document.
2. Define the four PopStop agent roles, inputs, outputs, handoff order, 95/100 scoring gate, and final launch pack.
3. Verify only the requested documentation files changed, then record completion.

## Faculty Collaborator Invite Check Plan

1. Check repository evidence for collaborator invitation status.
2. Mark `SUBMISSION.md` complete only if the collaborator invite has been sent.
3. Add a short completion note to this file.

## Submission Checklist Update Plan

1. Use the current repository state and requested submission status as the source of truth.
2. Update only `SUBMISSION.md` for checklist and GitHub status changes.
3. Record the completion note in this todo file after verifying the final checklist.

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

- 2026-06-30: Created the static Restaurant Intelligence Platform landing page at `app/landing/page.tsx` with hero, problem, workflow, AI trust, target user, CTA, and footer sections; preserved the existing app shell and architecture; verified `npm run lint`, `npm run typecheck`, and `npm run build`.
- 2026-06-30: Created `evidence/codex-architecture-review.md` summarizing Codex architecture review Questions 1-4 with ranked missing components, top technical tasks, risk mitigations, and final implementation priorities; no application code was modified.
- 2026-06-30: Created `RELIABILITY_CHECKLIST.md`, `PRODUCT_EVALUATION.md`, and `ONBOARDING_FRICTION_REPORT.md` for Review Insight Generation reliability risks, end-to-end product evaluation scenarios, and first-time onboarding friction tracking; no app features, API routes, schema edits, dependencies, or unrelated files were changed.
- 2026-06-30: Created `AGENT_TEAM_HANDOFF.md` documenting the Session 12 PopStop-style agent team handoff exercise, including agent roles, tasks, model reasoning levels, inputs, outputs, handoff order, 95/100 scoring gate, and final approved launch pack output.
- 2026-06-29: Checked available repository evidence for the faculty collaborator invite; no sent invite was verified, so `SUBMISSION.md` keeps the item unchecked with an explicit status note.
- 2026-06-29: Updated `SUBMISSION.md` for Deliverable 2 status, checked the canonical folders, README, branch, Codex connection, `d2-ready` tag, and repository link items per the requested submission status, replaced the GitHub suspension note with the restored `mickeyburke35-dotcom` account status, and left only "Faculty invited as collaborators" incomplete.
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
