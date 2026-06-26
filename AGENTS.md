# AGENTS.md

## Project

Restaurant Intelligence Platform is a B2B SaaS product for hospitality marketing agencies, restaurant consultants, and multi-location restaurant groups. It collects approved public restaurant reviews, sentiment, competitor activity, and market signals, then turns them into dashboards, reports, and recommendations for teams managing multiple restaurant clients.

Primary users are agency owners, account managers, analysts, consultants, and client viewers. Use a professional, modern, clear, data-driven voice. Prefer concrete product language. Avoid: revolutionary, game-changing, cutting-edge, best-in-class, world-class, magic, effortless, seamless, disruptive, synergy, leverage unless technically required, incredible, amazing, ultimate, next-generation, obviously, simply, and just.

## Stack And Structure

Use one React/Next.js app with API routes and background jobs in the same repo. Backend code runs on Node.js through Next.js API routes, with Express only if later required. Use PostgreSQL with Prisma for schema management, migrations, typed data access, and tenant-aware queries. Host the frontend on Vercel; use Render or Railway for backend services and database needs. Use the OpenAI API for review summarization and sentiment analysis.

Structure: app/ pages and UI, app/api/ API routes, components/ reusable UI, lib/ shared logic, jobs/ scheduled review and competitor collection, db/ Prisma schema, migrations, and query helpers.

Use npm: npm install, npm run dev, npm run build, npm run lint, npm run typecheck, npm test, npx prisma migrate dev, npx prisma generate, and npx prisma studio.

## Architecture Rules

This is an agency-based multi-tenant product. Each user belongs to one agency. Agencies manage multiple restaurant clients, but all data must be isolated by agency_id. Roles: Owner/Admin manages billing, users, clients, and settings; Manager manages dashboards, reports, and insights; Analyst views and edits insights and reports; Viewer/Client has read-only dashboard access.

Every API route, Prisma query, job, report, export, and AI prompt must enforce tenant scope. Never expose data across agencies. Raw SQL is allowed only when Prisma cannot express the query clearly, and must be reviewed for parameterization, security, and tenant isolation.

Data collection is API-first and compliance-first. Use official APIs, partner APIs, exports, or clearly permitted public pages. Respect robots.txt, site terms, and rate limits. Use conservative scheduling, caching, and deduplication. Never collect private messages, login-protected content, contact details, payment data, employee data, sensitive personal information, secrets, customer exports, or unapproved raw data.

## AI Rules

Treat AI as an assistant, not an authority. Generate concise, objective summaries only from collected data. Never invent facts, statistics, reviews, or competitor information. If data is insufficient or confidence is low, say so. Include confidence levels or supporting evidence where possible.

Store AI-generated insights separately from source reviews with timestamp, model, confidence score when available, and links to source reviews. High-impact recommendations require human review before being presented as business advice. Every insight must be explainable and traceable to public source data.

## Product And Code Standards

UI should be clean, modern, Scandinavian-inspired, responsive, and WCAG-friendly. Prioritize actionable insights over raw data. Dashboards and reports should include KPI summaries, cards, tables, charts, filters by restaurant/date/location/sentiment, and PDF/CSV export. Tables should be sortable, searchable, and paginated. Charts need tooltips, clear labels, and consistent sentiment colors. Empty states must explain missing data and suggest the next action.

Use strict TypeScript; avoid any unless justified. Validate API inputs with Zod or an equivalent schema validator. Return user-safe errors and log server-side details. Comment complex logic only. Never commit secrets, API keys, tokens, customer data, production credentials, or private datasets.

## Workflow

Before coding, read AGENTS.md, README.md if present, memory/MEMORY.md, memory/lessons.md, tasks/todo.md, and relevant files. Update tasks/todo.md with the planned task and write a short implementation plan before changes.

Work in small, focused edits that match existing naming, structure, and patterns. Ask for approval before adding dependencies, changing architecture, modifying auth or tenant logic, changing database schema, changing data collection rules, or altering AI insight behavior. Use branch names like feature/review-insights-dashboard or fix/tenant-filtering. PRs need a summary, testing notes, screenshots for UI changes, and migration notes when relevant.

## Documentation And Done

Update README.md when setup, commands, environment variables, or architecture change. Document API routes with purpose, inputs, outputs, auth requirements, and error cases. Keep .env.example complete.

Definition of Done: implementation matches scope; tenant isolation and data security are preserved; TypeScript, ESLint, tests, relevant API tests, migrations, and build pass; Prisma client is regenerated after schema changes; basic manual UI review is complete; Playwright E2E passes for major dashboards or user flows; docs and tasks/todo.md are updated.
