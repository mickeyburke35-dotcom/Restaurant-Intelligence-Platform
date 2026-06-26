# App Plan — Restaurant Intelligence Platform

## 1. App Overview
Restaurant Intelligence Platform is a B2B SaaS product for hospitality marketing agencies, restaurant consultants, and multi-location restaurant groups. It collects approved public restaurant reviews, sentiment, competitor activity, and market signals, then turns them into dashboards, reports, and recommendations for teams managing multiple restaurant clients. v1 focuses on agency-scoped review intelligence: onboarding an agency, adding restaurant clients and locations, importing or connecting approved review sources, viewing sentiment trends, generating explainable AI summaries, and exporting client-ready reports. Every view, query, report, and AI request must preserve `agency_id` isolation.

## 2. Key Components
- Email/password and Google sign-in with agency membership and role-based access for Owner/Admin, Manager, Analyst, and Viewer/Client.
- Agency workspace with client, location, user, role, and settings management.
- Restaurant review ingestion from approved APIs, partner exports, CSV upload, or manually entered sample data for v1 demos.
- Tenant-scoped dashboard with KPI cards, sentiment trend charts, review volume, rating movement, and recent alerts.
- Reviews table with sorting, search, pagination, filters by restaurant, location, date, source, rating, and sentiment.
- AI insight engine that summarizes collected reviews, assigns sentiment, records model name, timestamp, confidence, and source review links.
- Competitor tracking view for named competitors, public rating snapshots, review themes, and market signal notes.
- Report builder with PDF and CSV export for selected client, location, date range, and insight set.
- Admin audit trail for data imports, AI insight creation, report generation, and user access changes.

## 3. App Structure
Screens:
- Sign In: authenticates users and routes them into their agency workspace.
- Agency Home: shows portfolio-level KPIs, priority insights, and client list.
- Client Dashboard: shows one restaurant client across all locations.
- Location Detail: shows review trends, review table, and source evidence for one location.
- Reviews: lets analysts inspect, filter, tag, and export reviews.
- Insights: lists AI-generated insights with confidence, evidence, and human review status.
- Competitors: compares selected client locations with named competitors.
- Reports: builds and exports client-facing summaries.
- Admin Settings: controls users, roles, clients, sources, billing placeholder, and audit log.

Navigation flow: Sign In leads to Agency Home after authentication. Agency Home opens Client Dashboard from a client row. Client Dashboard opens Location Detail, Reviews, Insights, Competitors, or Reports through the left sidebar and contextual buttons. Admin Settings is available only to Owner/Admin. Viewer/Client lands directly on their permitted Client Dashboard and cannot open editable settings.

## 4. User Interface
Use a clean, modern, Scandinavian-inspired SaaS interface with high contrast text, restrained color, 8px or smaller card radius, and consistent sentiment colors: positive green, neutral gray, negative red, mixed amber.

Sign In: centered panel with product name, email/password fields, Google sign-in button, error message area, and legal text.

Agency Home: fixed left sidebar with logo, Clients, Reviews, Insights, Reports, Competitors, Settings; top bar with agency switch label, date range control, and user menu. Main area has KPI cards, a sentiment trend chart, “Needs review” insight list, and a searchable client table.

Client Dashboard: header with client name, location count, source coverage, and export button. Body has rating trend line chart, review volume bar chart, sentiment split, top themes, recent reviews, and competitor summary.

Reviews: dense table with sticky filter row, source badges, rating stars, sentiment chips, review date, location, excerpt, evidence link, and bulk export button.

Insights: list/detail split. Left column shows insight title, confidence, status, and created date. Right panel shows summary, supporting reviews, model metadata, and approve/reject controls.

Reports: form sidebar for client, locations, date range, sections, and format. Preview area shows report pages with KPI summary, charts, insight narrative, evidence appendix, and export controls.

Admin Settings: tabbed layout for Users, Clients, Review Sources, AI Rules, Audit Log. Use tables, dialogs, role selects, toggles, and confirmation modals.

## 5. Backend Requirements
A backend is required for authentication, tenant isolation, review storage, scheduled jobs, AI calls, and exports.

Database schema:
- `agencies`: id, name, plan, created_at.
- `users`: id, email, name, auth_provider, created_at.
- `agency_members`: id, agency_id, user_id, role, status.
- `restaurant_clients`: id, agency_id, name, segment, notes.
- `locations`: id, agency_id, client_id, name, address, city, state, country, timezone.
- `review_sources`: id, agency_id, source_type, connection_status, last_sync_at.
- `reviews`: id, agency_id, client_id, location_id, source_id, external_id, rating, text, author_display_name_hash, review_url, published_at, collected_at.
- `competitors`: id, agency_id, client_id, location_id, name, source_url, notes.
- `competitor_signals`: id, agency_id, competitor_id, signal_type, value, source_url, observed_at.
- `ai_insights`: id, agency_id, client_id, location_id, insight_type, title, summary, confidence, model, source_review_ids, status, created_at.
- `reports`: id, agency_id, client_id, created_by_user_id, date_range_start, date_range_end, format, status, file_url.
- `audit_logs`: id, agency_id, user_id, action, entity_type, entity_id, created_at.

Every table carrying business data includes `agency_id`. Queries must filter by the signed-in user’s active agency and role. Store exports in private storage with signed download URLs. Keep API secrets server-side only.

## 6. APIs and Libraries
- Next.js App Router: frontend screens, layouts, route handlers, and server-rendered dashboard/report views.
- Next.js API routes on Node.js: tenant-scoped application APIs for auth callbacks, clients, locations, reviews, insights, competitors, reports, exports, and audit logs.
- PostgreSQL with Prisma: schema management, migrations, generated client, tenant-aware query helpers, and test data seeding.
- Background jobs in `jobs/`: scheduled review imports, approved source syncs, competitor signal collection, deduplication, and AI insight refreshes, deployed through Render, Railway, or Vercel cron after source compliance is confirmed.
- OpenAI API: review summarization, sentiment classification, theme extraction, and concise insight generation from collected evidence only.
- Approved review APIs or exports: Google Business Profile/Places where authorized, Yelp Fusion where permitted, partner exports, CSV upload.
- Recharts or an equivalent React chart library: KPI charts, trend lines, bar charts, and sentiment breakdowns with labels and tooltips.
- Zod: form and API payload validation.
- Server-side PDF and CSV generation: report export, review export, evidence appendix export, and signed download URLs.

## 7. Testing Strategy
Unit test tenant filter helpers, role permission checks, sentiment color mapping, report section selection, and AI prompt builders. Integration test sign-in, client creation, review import, review filtering, insight generation, approval flow, report export, and signed file download. Security tests must prove a user from Agency A cannot read, export, or infer Agency B data. User acceptance passes when a Manager can add a client, import approved reviews, view dashboard KPIs, approve an AI insight with evidence, and export a report in under 10 minutes using seeded demo data.

## 8. Build Readiness: Architecture, Assumptions, Risks, and Next Step
Weakest section before this rewrite: the prior platform guidance mixed a Lovable/Supabase prototype path with the required Next.js, Prisma, and PostgreSQL implementation path. That made the first build step, deployment target, data-access pattern, and tenant-scope enforcement ambiguous.

Architecture decisions for v1:
- Build one React/Next.js app in this repo with UI routes under `app/`, reusable components under `components/`, API routes under `app/api/`, shared tenant/auth/data helpers under `lib/`, background jobs under `jobs/`, and Prisma schema/migrations under `db/` and `migrations/`.
- Run backend code on Node.js through Next.js API routes. Add Express only if a later requirement cannot be handled cleanly by route handlers or jobs.
- Use PostgreSQL as the system of record and Prisma for schema management, migrations, generated types, tenant-aware query helpers, and seed data.
- Resolve the signed-in user, role, active `agency_id`, client scope, and location scope before every business data read or write.
- Store AI-generated insight records separately from source reviews with model, timestamp, confidence, source evidence, status, and audit log references.
- Keep review collection API-first and compliance-first. Use official APIs, partner exports, CSV uploads, or clearly permitted public pages only after source terms, rate limits, and approval status are documented.
- Deploy the frontend on Vercel. Use Render or Railway for PostgreSQL, scheduled jobs, and any backend service that cannot run reliably inside Vercel limits.
- Store exports in private storage and return signed download URLs. Keep OpenAI and review provider credentials server-side only.

Assumptions for the first build:
- v1 starts with seeded demo data and CSV import before live provider integrations.
- Each user belongs to one agency for the initial workspace experience; future multi-agency switching can reuse the same membership model.
- Owner/Admin, Manager, Analyst, and Viewer/Client roles are sufficient for v1 permissions.
- Competitor signals can begin as manually entered or imported permitted public observations before automated collection.
- AI summaries are draft assistance, not final advice. High-impact recommendations and client-facing narratives require human review.
- Report exports can be generated on demand for selected clients, locations, date ranges, and approved insight sets.

Primary risks and mitigations:
- Cross-tenant exposure: require `agency_id` in every Prisma query, API route, job, AI prompt payload, export, and audit log; add tests proving Agency A cannot read or infer Agency B data.
- Unsupported AI claims: require source review IDs or competitor signal IDs for every generated insight claim; mark insufficient evidence clearly.
- Unauthorized data collection: block unapproved sources, document provider permissions, respect robots.txt and terms, and use conservative scheduling with deduplication.
- Client-facing recommendations without review: store strategic or high-impact recommendations as `Needs human review` until a Manager approves them.
- Stale or sparse data: display source coverage, sample counts, comparison windows, competitor `observed_at` dates, and confidence labels.
- Prompt injection from review text: treat review content as untrusted evidence and prevent it from changing system, tenant, or source-compliance rules.

Next build step:
Scaffold the Next.js + TypeScript + Prisma foundation first. The first implementation slice should create the app structure, Prisma schema for agencies, users, agency memberships, clients, locations, review sources, reviews, competitors, competitor signals, AI insights, reports, and audit logs; add tenant-scope helper functions; seed two agencies with separated demo data; and add tests that prove cross-agency reads are denied before building dashboards or AI workflows.

## 9. Out of Scope for v1
- Scraping sites without explicit permission, bypassing terms, or collecting login-protected data.
- Billing, invoicing, subscription enforcement, and payment collection.
- Fully automated high-impact business advice without human review.
- Native mobile apps.
- White-label client portals beyond Viewer/Client dashboard access.
- Real-time alerts through Slack, email, or SMS.
- Complex benchmark modeling across cities or cuisine categories.
- Direct POS, reservation, payroll, or payment data integrations.

## 10. Definition of Done
- Agency login, membership, roles, and Viewer/Client read-only access work with seeded demo users.
- All business data reads and writes filter by `agency_id`, with tests for cross-agency denial.
- A Manager can create one client, add locations, import approved review data, and view dashboard KPIs.
- AI insights include model, timestamp, confidence, status, and source review evidence.
- Reports export to PDF and CSV for a chosen client and date range.
- Empty states explain missing data and show the next action.
- Next.js build, lint, typecheck, tenant-scope tests, and core API tests pass; secrets remain server-side and outside browser-exposed variables.
