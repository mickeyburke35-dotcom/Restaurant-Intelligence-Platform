# Session 18 Mini-Project Walkthrough

## How The Course Pieces Fit Together

This walkthrough keeps the course artifacts aligned with the Restaurant Intelligence Platform: a B2B SaaS workspace for agencies, consultants, and multi-location restaurant teams that review approved restaurant feedback, generate traceable AI insights, and prepare client-ready dashboards or reports.

| Course piece | Role in this project | Current alignment |
| --- | --- | --- |
| Idea + PRD | The product idea becomes the PRD: agency-scoped review intelligence with onboarding, restaurant clients, locations, approved review sources, dashboards, AI draft insights, competitor signals, and exports. | Captured in `PRD.md`, with v1 focused on tenant isolation, approved review data, explainable insights, and human review. |
| Design | The design system turns the idea into a calm analyst workspace rather than a marketing page or restaurant-themed interface. | Captured in `DESIGN.md`: Scandinavian-inspired SaaS layout, evidence-first AI cards, sentiment colors, sortable tables, filters, charts, and client-ready report patterns. |
| Build | The build translates the PRD and design into one Next.js app with API routes, reusable components, shared logic, jobs, and Prisma-backed data access. | The repo already contains the scaffold and some documentation for review dashboards and review source APIs. This Session 18 work does not modify application code. |
| Google AI Studio integration | In the course flow, Google AI Studio can be used as a prompt and behavior prototyping surface for testing review summarization, sentiment language, confidence wording, and evidence constraints. | The canonical product architecture uses the OpenAI API for the backend AI service. Google AI Studio should be treated as a course/prototype artifact unless the architecture is formally changed. |
| Supabase data | In the course flow, Supabase can represent prototype data storage, seeded demo tables, or a quick validation surface for agencies, restaurants, locations, sources, reviews, and insight records. | The canonical repo direction is PostgreSQL with Prisma. Any Supabase artifact should map back to the same tenant-scoped data model and must not become an unreviewed production data path. |
| Zapier automation | Zapier can prototype workflow automation such as "approved CSV uploaded" to "notify analyst" or "Manager approves insight" to "prepare report task." | Production automation is not claimed. The canonical architecture keeps scheduled jobs in `jobs/` and requires compliance-first data collection. Zapier is useful as course evidence for automation logic, not as proof of production readiness. |
| MVP logic | The MVP logic is the minimum review-intelligence loop: import approved reviews, filter and inspect them, draft AI insights from source evidence, verify evidence, require human approval, and export a client report. | This matches the PRD, AI behavior spec, and Session 18 loop one-pager. The product must not invent review data, market claims, customer data, or traction. |
| GitHub repo | The repo is the durable source of truth for docs, app code, evidence artifacts, task history, and security workflow. | `AGENTS.md`, `README.md`, `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `AI_BEHAVIOUR.md`, and `tasks/todo.md` define the canonical project. PopStop and Videoreport are explicitly not product artifacts for this repo. |

## End-To-End Story

An agency user starts from the PRD-defined problem: managing review intelligence across multiple restaurant clients without mixing tenant data or turning AI drafts into unsupported advice. The design spec shapes that into a quiet dashboard with visible agency, client, location, role, date range, source, confidence, and evidence context.

The build then implements the product as a Next.js application with tenant-scoped APIs and Prisma queries. Prototype tools can help test slices of the system: Google AI Studio for prompt behavior, Supabase for course/demo data modeling, and Zapier for automation experiments. Those artifacts are useful only when they stay aligned with the canonical rules: approved data, tenant isolation, traceable AI output, and human approval.

The MVP is credible when a user can show the complete logic with seeded or approved demo data: imported reviews flow into a dashboard, an AI draft insight cites source reviews, the verifier catches unsupported claims, and a Manager approves or rejects the result before it appears in a report.

