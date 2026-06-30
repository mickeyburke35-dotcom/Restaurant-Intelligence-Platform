# Codex Architecture Review

## Repository
Restaurant Intelligence Platform

## Review Date
2026-06-30

---

## Question 1
Is the architecture sound?

The architecture is sound for an MVP foundation. The repository has a coherent direction: one Next.js application, API routes planned in the same repo, PostgreSQL and Prisma as the system of record, Zod for validation, and background jobs separated under `jobs/`. The Prisma schema is the strongest implementation artifact because it models agencies, users, memberships, restaurants, locations, review sources, reviews, insights, competitors, reports, scheduled jobs, and audit logs with agency-scoped relationships.

The main caveat is that the implementation is still early. Tenant isolation, authorization, service boundaries, API route conventions, tests, migrations, and runtime operations are designed in documentation and schema, but not yet enforced in application code.

Decision:
- Accept
- Reason: The architecture is appropriate for an MVP at this stage, provided the next implementation slice focuses on security enforcement, tenant-aware data access, migrations, API/service structure, and tests before dashboard or AI feature work.

---

## Question 2
What is structurally missing?

| Rank | Missing Component | Severity | Decision | Notes |
| --- | --- | --- | --- | --- |
| 1 | Authentication | Critical | Accept | No sign-in, session handling, auth provider integration, route protection, or active user resolution exists yet. |
| 2 | Authorization | Critical | Accept | Roles exist in the Prisma schema, but Owner/Admin, Manager, Analyst, Viewer, client scope, location scope, and read-only rules are not enforced in code. |
| 3 | Tenant Data Layer | Critical | Partially Accept | The schema includes `agency_id` and tenant-aware relations, but there are no Prisma client wrappers, tenant query helpers, or soft-delete conventions in `lib/` or `db/`. |
| 4 | API Structure | High | Accept | There are no `app/api/` routes, route guard patterns, response conventions, or route-level tenant context patterns yet. |
| 5 | Service Layer | High | Accept | Business logic has no implementation home yet for clients, locations, reviews, insights, reports, exports, jobs, or audit events. |
| 6 | Validation | High | Partially Accept | Zod is installed, but shared request schemas, filter schemas, import schemas, export schemas, and typed parsing helpers do not exist yet. |
| 7 | Testing | Critical | Accept | `npm test` is a placeholder, and there are no automated tests for tenant isolation, role permissions, API denial paths, reports, exports, or AI evidence boundaries. |
| 8 | Logging | High | Accept | `AuditLog` exists in Prisma, but there is no structured logging, request ID strategy, redaction policy, or audit service. |
| 9 | Background Jobs | High | Accept | `jobs/` exists but is empty, with no worker runtime, scheduling strategy, locking, retries, rate limits, source approval checks, or job observability. |
| 10 | Environment Management | Medium | Partially Accept | `.env.example` exists, but there is no typed environment validation, server-only/public variable separation policy in code, or staging/production environment contract. |
| 11 | Deployment | Medium | Partially Accept | Documentation names Vercel plus Render or Railway, but there is no deployment configuration, migration process, job deployment path, private storage decision, or health check pattern. |

---

## Question 3
Top Five Technical Tasks

1. Create the initial Prisma migration.
   - Why it blocks progress: The schema validates, but the database cannot be reproduced or deployed reliably without a committed migration.
   - Timing: Do immediately.

2. Implement tenant-scope data helpers.
   - Why it blocks progress: Future routes need one shared way to apply `agency_id`, active membership, role, client scope, location scope, and soft-delete rules.
   - Timing: Do immediately.

3. Add two-agency seed data.
   - Why it blocks progress: Tenant isolation and dashboard behavior cannot be tested without separated demo agencies and sample records.
   - Timing: Do immediately after the migration is available.

4. Set up real tenant isolation tests.
   - Why it blocks progress: Cross-agency denial is the central product safety requirement, and the current test command does not verify anything.
   - Timing: Do immediately.

5. Define the first API/auth boundary.
   - Why it blocks progress: Every API route needs a consistent pattern for resolving the signed-in user, active agency, membership role, and allowed client/location scope.
   - Timing: Do immediately.

---

## Question 4
Biggest Technical Risks

| Risk | Severity | Mitigation | Accepted? |
| --- | --- | --- | --- |
| Missing authentication | Critical | Select and implement the auth provider, session handling, route protection, and active user resolution before exposing business data. | Yes |
| Tenant isolation enforcement | Critical | Add tenant context helpers, Prisma query wrappers, API guard patterns, and cross-agency denial tests. | Yes |
| Authorization | Critical | Implement role, client scope, location scope, and Viewer read-only checks in shared permission helpers. | Yes |
| Database migration | High | Create and commit the initial Prisma migration, then document the migration process for deployment. | Yes |
| API structure | High | Establish `app/api/` route conventions for auth guards, validation, service calls, user-safe errors, and audit logging. | Yes |
| Missing tests | Critical | Replace the placeholder test command with tests for tenant helpers, permissions, API denial paths, reports, exports, and AI boundaries. | Yes |
| AI reliability | High | Build evidence-only prompt builders, source review linking, confidence handling, prompt-injection safeguards, and human approval workflow checks. | Yes |
| Background jobs | High | Define worker runtime, schedules, idempotency, locks, retries, source approval checks, rate limits, and job logs. | Yes |
| Logging | High | Add structured server logging, request IDs, redaction rules, and an audit event service. | Yes |
| Maintainability | High | Implement shared auth, tenant, validation, service, error, logging, and test patterns before feature routes multiply. | Yes |

---

## Final Architecture Decision

The overall architecture is appropriate for an MVP.

The immediate implementation priorities are:

1. Authentication
2. Tenant enforcement
3. Prisma migration
4. API/service layer
5. Testing

No architecture changes are required at this stage. Implementation is the priority.
