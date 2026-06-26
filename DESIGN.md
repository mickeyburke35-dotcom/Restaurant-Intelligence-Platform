# DESIGN.md — Restaurant Intelligence Platform

## 1. Design Principles
Decision-first, not decoration-first: every screen should help an agency spot risk, opportunity, or the next client action.
Calm under density: analytics, evidence, filters, and exports can share a page without noise or visual strain.
Trust comes from traceability: AI summaries, recommendations, and alerts must show confidence, source evidence, and review status.
Agency command, analyst precision: portfolio views feel controlled and executive; detail views feel inspectable and exact.
Minimal, not empty: whitespace creates hierarchy, while tables, charts, and controls keep the product work-ready.

## 2. Color Palette
Primary: Oat Sand `#F4EFEA` for app background, page bands, and quiet empty states.
Text/Nav: Nordic Slate `#2B3A42` for primary text, sidebar, headings, icons, and the flat minimalist logo on light backgrounds.
Secondary: Turbine Green `#3F5E4D` for chart series, secondary actions, selected navigation, and positive analytical emphasis.
Accent: Volt `#E1FA75` for primary CTA buttons, active filters, key indicators, and critical “look here” moments; use with Nordic Slate text.
Neutrals: Cloud `#FBFAF8` for panels; Line `#D8CEC5` for borders; Stone `#A79C92` for secondary labels; Graphite `#65727A` for metadata.
Semantic: Success `#3F5E4D`; Warning `#B9842E`; Error `#B84A4A`; Neutral sentiment `#8B9497`; Mixed sentiment `#C29A3D`. Keep semantic colors consistent in charts, chips, and alerts.

## 3. Typography
Headings: Plus Jakarta Sans, weights 600 and 700. Body: Inter, weights 400 and 500. Use 12 metadata, 14 table/body, 16 default UI, 20 section headings, 24 page headings, 32 dashboard headings, 40 sign-in/product moments. The pairing should feel editorial, precise, and calm at high information density.

## 4. Components & UI Patterns
Buttons: 6px radius, 36–40px height, medium weight labels. Primary buttons use Volt fill with Nordic Slate text; hover darkens the border, press lowers opacity. Secondary buttons are Cloud or transparent with a Line border. Destructive actions use Error only at confirmation points.
Cards/Panels: 6px radius, 1px Line border, Cloud fill, no heavy shadows. KPI cards use strong numbers, small deltas, and compact sparkline areas. Do not place cards inside cards.
Inputs/Filters: 36px height, 6px radius, Line border, Cloud fill, visible focus ring in Volt with a Nordic Slate offset. Filters sit in sticky rows on data-heavy pages.
Navigation: fixed left sidebar in Nordic Slate with Oat Sand labels and Volt active markers. Top bar stays light with agency, date range, search, and user menu.
Tables/Charts: dense tables with sticky headers, sortable columns, row hover, sentiment chips, source badges, and evidence links. Charts use Turbine Green plus semantic colors, thin gridlines, direct labels, and tooltips with source context.

## 5. Layout & Spacing
Use a 12-column desktop grid with a 240px fixed sidebar, 24px page gutters, and 16px panel gaps. Build on a 4px spacing rhythm: 8 for compact controls, 16 for groups, 24 for sections, 40 for major screen breaks. Prefer asymmetric 60/40 or list/detail compositions for Insights, Reports, and Reviews: work queue on the left, evidence or preview on the right. Breakpoints: mobile under 640, tablet 640–1024, desktop above 1024. Mobile collapses navigation to a top bar and turns dense tables into filterable row summaries.

## 6. Microcopy & Tone
Voice: professional, clear, concrete, and evidence-led. Say what happened, what data supports it, and what action is available.
Button: “Import approved reviews”
Empty state: “No reviews in this date range. Connect an approved source or upload a CSV to start analysis.”
Insight status: “Needs human review”
Error: “We could not load this client. Check access or contact an admin.”
Report CTA: “Export client report”

## 7. Motion & Interaction
Motion should feel fast, quiet, and functional. Use 120–180ms transitions for hover, focus, menu open, and panel changes with ease-out timing. Tables highlight rows on hover without shifting layout. Charts animate once on load under 300ms, then stay still. Use restrained skeleton states for loading, small toasts for completed imports/exports, and persistent inline errors for forms. Primary actions show clear press, loading, success, and failure states.

## 8. Anti-Patterns (do NOT do)
Do not use these words in product copy: revolutionary, game-changing, cutting-edge, best-in-class, world-class, magic, effortless, seamless, disruptive, synergy, leverage, incredible, amazing, ultimate, next-generation, obviously, simply, just.
Reject the generic restaurant-product mean: no chefs, food photography, utensils, menu textures, reservation imagery, warm bistro styling, chalkboard motifs, or appetite-led visuals.
Reject generic AI styling: no purple gradients, sparkle icons, chatbot mascots, glowing blobs, glassmorphism, or claims that AI is an authority.
Reject soft SaaS sameness: no bright corporate blue as the brand anchor, no oversized illustrations, no playful pill-heavy UI, no rounded toy-like controls, no heavy shadows, no skeuomorphic panels.
Reject clutter: no decorative cards, nested cards, dashboard walls of equal-weight widgets, unlabeled charts, weak contrast, hidden tenant context, or AI insights without evidence.
