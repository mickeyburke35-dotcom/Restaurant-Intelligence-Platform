# Architecture Checklist

## Readiness Audit Result

PRD readiness after Run Loop L01: ready for the first build slice.

| Area | Status | Evidence |
| --- | --- | --- |
| Problem | Explicit | `PRD.md` section 1 states the product turns approved restaurant reviews, sentiment, competitor activity, and market signals into dashboards, reports, and recommendations. |
| Target user | Explicit | `PRD.md` sections 1-3 define hospitality agencies, consultants, multi-location restaurant groups, and role-specific users. |
| Features | Explicit | `PRD.md` sections 2-4 define auth, agency workspace, review ingestion, dashboards, reviews, insights, competitors, reports, and audit trail. |
| Architecture | Explicit | `PRD.md` sections 5, 6, and 8 now define Next.js, API routes, PostgreSQL, Prisma, jobs, tenant helpers, storage, and deployment boundaries. |
| Acceptance criteria | Explicit | `PRD.md` sections 7 and 10 define tests, cross-agency denial, user acceptance, report export, and build/lint/typecheck expectations. |
| Assumptions | Explicit | `PRD.md` section 8 now lists first-build assumptions for seeded data, roles, competitor signals, AI review, and exports. |
| Risks | Explicit | `PRD.md` section 8 now lists tenant exposure, AI claims, unauthorized collection, review requirements, stale data, and prompt injection mitigations. |
| Next build step | Explicit | `PRD.md` section 8 now defines the first implementation slice: scaffold Next.js, Prisma schema, tenant helpers, seed data, and cross-agency tests. |

## Weakest Section Rewritten

Weakest section: old `PRD.md` section 8, Platform-Specific Considerations.

Reason: it mixed a Lovable/Supabase prototype path with the project-required Next.js, Prisma, PostgreSQL, API route, and jobs architecture. That conflict made the first build target and tenant-scope enforcement path unclear.

Replacement: `PRD.md` section 8 is now `Build Readiness: Architecture, Assumptions, Risks, and Next Step`.

## Gaps Closed

- [x] Replaced the Lovable/Supabase prototype path with the required Next.js + Prisma + PostgreSQL architecture.
- [x] Named the repo structure for UI routes, API routes, reusable components, shared helpers, jobs, Prisma schema, and migrations.
- [x] Clarified that backend code runs through Next.js API routes on Node.js, with Express deferred unless clearly required later.
- [x] Made tenant resolution a first-class architecture requirement before every business data read or write.
- [x] Clarified that AI insight records stay separate from source reviews and carry model, timestamp, confidence, evidence, status, and audit references.
- [x] Added compliance-first data collection constraints for approved APIs, partner exports, CSV uploads, permitted public pages, source terms, and rate limits.
- [x] Defined deployment boundaries for Vercel, Render or Railway, PostgreSQL, scheduled jobs, private exports, and server-side secrets.
- [x] Added first-build assumptions for seeded data, CSV import, role model, competitor signals, AI review, and report exports.
- [x] Added risk mitigations for cross-tenant exposure, unsupported AI claims, unauthorized collection, client-facing advice, stale data, and prompt injection.
- [x] Replaced the vague platform migration path with a concrete first build step.
- [x] Updated the API and library section to align with Next.js, Prisma, Zod, Recharts or equivalent charts, OpenAI, jobs, and server-side exports.
- [x] Updated the Definition of Done to require Next.js build, lint, typecheck, tenant-scope tests, core API tests, and server-side secret handling.

## Build Gate Checklist

- [ ] Scaffold the Next.js + TypeScript project structure.
- [ ] Add Prisma schema and migrations for the v1 data model.
- [ ] Implement tenant-scope helper functions before dashboard work.
- [ ] Seed at least two agencies with isolated demo data.
- [ ] Add tests proving cross-agency reads and exports are denied.
- [ ] Confirm approved review source policy before live provider collection.
- [ ] Choose PDF, CSV, chart, and private storage libraries during implementation review.
