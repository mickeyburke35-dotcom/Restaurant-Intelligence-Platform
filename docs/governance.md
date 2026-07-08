# Restaurant Intelligence Governance Canvas

This canvas defines how the Restaurant Intelligence Platform treats data, access, AI supervision, and non-negotiable limits. It applies only to Restaurant Intelligence Platform artifacts and excludes unrelated coursework or external project content.

## Box 1: Data

- Governed data includes agencies, memberships, restaurants, locations, review sources, approved public restaurant reviews, AI insights, report snapshots, audit logs, and demo lead emails.
- Restaurant intelligence data belongs in the PostgreSQL and Prisma system of record, with tenant-scoped tables carrying `agency_id` where business isolation is required.
- Supabase is currently limited to the demo lead capture route. It should not become a restaurant, review, location, insight, report, or membership system of record without an approved architecture change.
- Review data may come from official APIs, partner APIs, permitted exports, CSV import, manual demo inputs, or clearly permitted public pages only after source permissions are documented.
- Imported review rows must be approved public review data. The current import path rejects unsupported contact-style columns and permits hashed author display names only.
- AI insights and reports must remain traceable to source reviews through review IDs, source names, excerpts, timestamps, model metadata, confidence labels, and human review status.
- Data minimization is required. Do not collect private messages, login-protected content, contact details, payment data, employee data, sensitive personal information, secrets, customer exports, or unapproved raw data.

## Box 2: Permissions

- Every agency user must be represented through an active membership tied to one agency and one role.
- Roles are Owner/Admin, Manager, Analyst, and Viewer/Client. Owner/Admin manages agency administration; Manager manages dashboards, reports, and insights; Analyst works on insights and reports; Viewer/Client is read-only.
- Restaurant-scoped memberships may access only their assigned restaurant scope.
- API routes, Prisma queries, jobs, AI prompts, report generation, exports, and audit records must resolve the active `agency_id`, user, role, and restaurant scope before business data access.
- Viewer/Client users must not create, edit, approve, reject, import, archive, or export restricted business data.
- Server-only secrets include database credentials, Supabase service-role keys, Zapier webhook URLs, Google AI keys, OpenAI placeholders, auth session secrets, and provider credentials. These must never be exposed in client components or `NEXT_PUBLIC_` variables.
- Supabase service-role access is allowed only from server code for the narrow demo lead capture use case currently implemented.

## Box 3: Supervision

- AI is an assistant, not an authority. AI output is draft analysis until a permitted human approves it.
- Draft insights must be generated only from selected, tenant-scoped, approved review evidence. Unsupported facts, statistics, competitor claims, source links, and business advice must be omitted.
- Human approval is required before approved insights become eligible for report snapshots. Rejected or draft insights must stay out of reports.
- High-impact recommendations and client-facing narratives require human review before presentation as business advice.
- Approval and rejection decisions should record reviewer, timestamp, decision status, and optional review notes for auditability.
- Review sources require approval before imported reviews can be used as source evidence.
- Failures, low-confidence evidence, sparse data, stale data, or conflicting evidence must be stated plainly rather than filled in with assumptions.

## Box 4: Red Lines

- No cross-agency data access, inference, export, report generation, AI prompt leakage, or tenant mixing.
- No scraping or collection that violates terms, robots.txt expectations, source permissions, rate limits, or source approval status.
- No private messages, login-protected content, personal contact details, payment data, employee data, sensitive personal information, secrets, customer exports, or unapproved raw datasets.
- No fabricated reviews, ratings, locations, restaurants, review sources, competitor information, market data, statistics, customer traction, testimonials, or production readiness claims.
- No automatic publishing, sending, or client-facing release of AI-generated insights or reports without human approval.
- No storage of third-party review content beyond the approved, permitted, and traceable use needed for the product.
- No service-role keys, API keys, auth secrets, database URLs, generated credentials, or private datasets in source control.
- No unrelated project, Amazon, Popstop, Videoreport, or coursework artifacts in Restaurant Intelligence Platform deliverables.
