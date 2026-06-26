# DESIGN.md - Restaurant Intelligence Platform

Use this as the product design spec for the Next.js product implementation or UI generation. This is a calm analyst workspace for agency teams, not a landing page, restaurant brand site, or decorative AI dashboard.

## 1. Design Direction

Build a Scandinavian-inspired B2B SaaS workspace: quiet, precise, data-led, and client-ready. The interface should feel like a professional operations desk for review intelligence across many restaurant clients.

Design dials:
- Visual variance: 4/10. Controlled asymmetry, no experimental layouts.
- Motion intensity: 2/10. Fast feedback only.
- Visual density: 6/10. Dense enough for analysts, calm enough for client viewers.

Core principles:
- Decision-first: every screen should help users spot risk, opportunity, evidence, or the next client action.
- Traceable by default: AI summaries, sentiment, alerts, and recommendations must show confidence, status, and source evidence.
- Tenant context is visible: agency, client, location, role, and date range should never feel ambiguous.
- Minimal, not empty: use spacing and hierarchy to reduce strain while preserving tables, filters, charts, and exports.
- Client-ready: reports and Viewer/Client screens should feel polished without hiding uncertainty or evidence.

## 2. Visual Point Of View

The product should feel like a calm analytics office: matte surfaces, crisp type, low-noise charts, and strong information hierarchy. Avoid visual tricks that make the product feel consumer, playful, or restaurant-themed.

Approved material language:
- Flat panels with 1px borders.
- Sparse dividers and section spacing.
- Very soft tinted shadows only when elevation has a clear job.
- Compact controls with consistent 6px radius.
- Charts and tables that read before they decorate.

Do not use glassmorphism, glowing blobs, purple or blue-purple gradients, sparkle icons, chatbot mascots, food photography, chef imagery, utensils, menu textures, chalkboard motifs, reservation imagery, bistro styling, or warm hospitality mood boards.

## 3. Color System

Use a cool Scandinavian neutral base with one restrained operational accent and fixed sentiment colors.

Tokens:
- App background: Birch `#F6F3EE`
- Panel surface: Cloud `#FBFAF7`
- Raised surface: Snow `#FDFCF9`
- Primary text: Nordic Slate `#26343B`
- Secondary text: Graphite `#647178`
- Muted text: Stone `#928A82`
- Border: Flax Line `#DCD4CA`
- Primary action and selected state: Pine `#3F5E4D`
- Focus and high-priority highlight: Lichen `#D9EA75`
- Positive sentiment: Green `#3F6F52`
- Neutral sentiment: Gray `#8B9497`
- Negative sentiment: Red `#B84A4A`
- Mixed sentiment: Amber `#B9842E`

Usage rules:
- Pine is the main product accent. Use it for primary actions, selected navigation, active filters, and important chart series.
- Lichen is a pinpoint highlight, not a page theme. Use it for focus rings, one active indicator, or one critical marker per surface.
- Sentiment colors must stay consistent in chips, tables, charts, tooltips, and reports.
- Do not use rainbow charts, arbitrary category colors, high-saturation gradients, or bright corporate blue as the brand anchor.
- Keep contrast WCAG AA or better for all text, controls, charts, and state labels.

## 4. Typography

Use one calm sans family across the product. Prefer Geist or Plus Jakarta Sans. Use Inter only if it is the existing system default. Do not use decorative serif, script, handwritten, or restaurant-menu typography.

Type scale:
- 11-12px: metadata, table captions, timestamps.
- 13px: dense table cells and filter labels.
- 14px: standard UI text, nav, buttons, form inputs.
- 16px: body copy and empty states.
- 20px: section headings.
- 24px: page titles.
- 32px: portfolio-level dashboard title or sign-in product moment only.

Rules:
- Use weights 400, 500, 600, and 700 only.
- Use tabular numbers for KPIs, ratings, counts, percentages, and dates.
- Headings should be specific and short: "Review risk", "Sentiment trend", "Needs review".
- Avoid oversized marketing typography inside the app.

## 5. App Shell And Layout

Desktop shell:
- Fixed left sidebar: 240px wide, Pine or Nordic Slate background, 64px minimum logo area.
- Top context bar: 56-64px high with active agency, client or location, date range, search, and user menu.
- Main workspace: 24px page gutters, 16px panel gaps, 12-column grid for dashboard composition.

Primary screen patterns:
- Agency Home: KPI strip, portfolio sentiment trend, priority insight queue, searchable client table.
- Client Dashboard: client header, source coverage, rating and sentiment charts, top themes, recent reviews, competitor summary.
- Location Detail: location context, trend charts, review evidence, source health, recent alerts.
- Reviews: sticky filter row, dense table, sortable columns, pagination, bulk export.
- Insights: list/detail split with evidence, confidence, model metadata, and approval controls.
- Reports: form sidebar and report preview. Keep export controls visible.
- Admin Settings: tabs, tables, dialogs, role selects, toggles, and audit log.

Layout rules:
- Do not build dashboard walls of equal-weight widgets. Create a clear primary reading path.
- Use list/detail layouts for work queues, evidence review, and report building.
- Use cards only for meaningful grouping. Never place cards inside cards.
- Keep page headers compact and functional. No hero sections inside the product.
- On mobile, collapse the sidebar into a top navigation, turn tables into filterable row summaries, and keep the primary action visible.

## 6. Components

Buttons:
- 36-40px height, 6px radius, medium label weight.
- Primary: Pine fill with light text.
- Secondary: Cloud or Snow fill with Flax Line border.
- Destructive: Red only for confirmation and irreversible actions.
- Every button needs hover, focus, active, loading, success, and disabled states.

Inputs and filters:
- Labels sit above inputs. Do not use placeholder text as the label.
- 36px height for compact fields, 6px radius, visible focus ring in Lichen with a Pine or Slate outline.
- Filters should be sticky on data-heavy screens and grouped by restaurant, location, date, source, rating, and sentiment.

Tables:
- Sticky headers, sortable columns, search, pagination, row hover, and keyboard focus.
- Include source badge, sentiment chip, review date, location, rating, excerpt, evidence link, and available actions.
- Keep row height compact but readable. Do not hide important tenant or source context.

Charts:
- Use Recharts or an equivalent chart library with tooltips, axis labels, readable legends, and direct labels when possible.
- Prefer line charts for trends, bars for volume, stacked bars for sentiment split, and compact sparklines inside KPIs.
- Tooltips should include date range, sample count, source, and confidence when relevant.
- Show insufficient-data states instead of fake precision.

AI insight cards:
- Required fields: title, summary, confidence, human review status, model, created date, source review count, and evidence links.
- Recommendations that affect client strategy must remain "Needs human review" until approved by a Manager.
- Never present AI as the final authority.

Reports:
- Report pages need a clear client name, date range, source coverage, KPI summary, charts, approved insights, and evidence appendix.
- PDF and CSV export controls must show loading, completion, and error states.

## 7. States And Feedback

Loading:
- Use skeletons that match the final layout for KPIs, rows, charts, and panels.
- Avoid generic center spinners except inside small buttons.

Empty:
- Explain what is missing and what action can populate the screen.
- Example: "No reviews in this date range. Connect an approved source or upload a CSV to start analysis."

Error:
- Use plain language and user-safe details.
- Example: "We could not load this client. Check access or contact an admin."

Permission:
- Viewer/Client users should see read-only dashboards and exports they are allowed to access.
- Restricted controls should be hidden or disabled with a clear reason.

## 8. Motion And Interaction

Motion should communicate feedback, not personality.

Rules:
- Use 120-180ms transitions for hover, focus, menus, dialogs, tabs, and panel changes.
- Chart animations may run once on load under 300ms, then remain still.
- Pressed buttons may use a 1px translate or slight opacity change.
- Toasts are for completed imports, exports, and transient status. Form errors stay inline.
- Respect reduced motion. No parallax, looping animation, kinetic typography, cursor effects, or decorative motion.

## 9. Microcopy

Voice: professional, concrete, data-driven, and evidence-led. Say what happened, what supports it, and what the user can do next.

Good examples:
- "Import approved reviews"
- "Needs human review"
- "View source evidence"
- "Export client report"
- "Source coverage is low for this period"
- "Confidence is limited because the sample size is small"

Rules:
- Use the banned-language list in `AGENTS.md` as prohibited product copy.
- Avoid hype, vague benefit claims, cute restaurant language, and AI authority claims.
- Prefer verbs tied to workflow: import, approve, compare, filter, review, export, connect.

## 10. UI Quality Gates

Before accepting a generated screen, check:
- It looks like an analyst workspace, not a marketing page.
- Tenant context, role context, client or location context, and date range are visible where needed.
- No glassmorphism, purple gradients, glowing AI visuals, restaurant-themed imagery, or food-service clichés appear.
- No banned marketing terms from `AGENTS.md` appear in visible copy.
- Components use the token system and do not introduce random blues, purples, or rainbow chart colors.
- Buttons, chips, table rows, dialogs, filters, and charts have complete loading, empty, error, focus, disabled, and success states.
- Tables are sortable, searchable, paginated, and readable on mobile.
- Charts have labels, tooltips, source context, and insufficient-data handling.
- AI insights show confidence, source evidence, model metadata, timestamp, and human review status.
- Cards are not nested, shadows are restrained, radius stays 6px, and the layout has one clear reading path.
- WCAG AA contrast passes for all text and controls.
- Viewer/Client screens are read-only and never expose other agency data.
