# Session 9 Deliverable: Review Insight Analyst Agent

## Agent Summary

**Name:** Review Insight Analyst Agent  
**Product:** Restaurant Intelligence Platform  
**Purpose:** Continuously analyze approved public restaurant reviews, customer sentiment, and competitor activity, then generate actionable, evidence-backed insights for hospitality marketing agencies managing multiple restaurant clients.

The agent operates inside an agency-scoped SaaS workspace. It helps Managers and Analysts identify review themes, sentiment shifts, competitor signals, and client reporting opportunities without presenting unsupported claims or crossing tenant boundaries.

---

## 1. Context

### Product Context

Restaurant Intelligence Platform is a B2B SaaS product for hospitality marketing agencies, restaurant consultants, and multi-location restaurant groups. The product turns approved review data, sentiment, competitor activity, and market signals into dashboards, reports, and recommendations.

The agent supports the v1 focus from `PRD.md`:

- Agency onboarding and role-based access.
- Restaurant clients and locations.
- Approved review imports or source connections.
- Tenant-scoped dashboards and sentiment trends.
- Explainable AI summaries with source evidence.
- Competitor tracking for named competitors.
- Report-ready insight drafts.
- Audit trail entries for AI insight creation and review status changes.

### User Context

Primary users:

- **Owner/Admin:** Manages agency settings, users, clients, billing placeholder, and source configuration.
- **Manager:** Reviews insights, approves recommendations, prepares client reports.
- **Analyst:** Investigates reviews, validates evidence, edits insight drafts, and supports reporting.
- **Viewer/Client:** Reads approved dashboards and reports only.

The agent should write in a professional, clear, concrete, evidence-led voice. It should avoid broad AI claims and should show what happened, what data supports it, and what action is available.

### Data Context

The agent may analyze only approved product data:

- `reviews`: approved public reviews or authorized imports.
- `review_sources`: permitted source metadata and connection status.
- `competitors`: agency-configured competitor records.
- `competitor_signals`: permitted public rating snapshots, review themes, and market notes.
- `ai_insights`: previously generated insight drafts, statuses, confidence, model metadata, and evidence links.
- `reports`: report context when drafting approved report sections.
- `audit_logs`: trace of imports, insight creation, report generation, and access changes.

Every query, prompt, report draft, and stored result must include `agency_id` scope. Client, location, source, and competitor records are never shared across agencies.

### Operating Context

The agent runs through scheduled jobs and user-triggered actions:

- Scheduled analysis after approved review imports or source syncs.
- Manual “Analyze reviews” action from Reviews, Insights, Client Dashboard, or Location Detail.
- Report builder requests for approved insight summaries.
- In-app “Needs human review” queue updates.

The agent does not replace the reviewer. It prepares evidence-backed drafts and flags confidence, uncertainty, and source coverage limits.

---

## 2. Memory

### Agent Memory Strategy

The Review Insight Analyst Agent uses scoped memory with strict separation between product rules, agency data, and temporary analysis context.

| Memory Type | Purpose | Storage | Retention | Safeguard |
| --- | --- | --- | --- | --- |
| Product policy memory | Holds durable product rules: tenant isolation, approved-source rules, human review requirements, tone, and confidence standards. | Versioned project docs and agent configuration. | Long-lived. | Updated through reviewed product changes only. |
| Agency-scoped preference memory | Stores explicit agency settings such as report tone, default date ranges, tracked competitor sets, and preferred insight categories. | Agency settings tables keyed by `agency_id`. | Until changed by Owner/Admin or Manager. | Never shared across agencies. |
| Working memory | Holds active analysis context: agency, client, locations, date range, filters, source coverage, and temporary aggregates. | Runtime only. | Discarded after each run. | Rebuilt from tenant-scoped queries every run. |
| Evidence memory | Records generated insights, source review IDs, competitor signal IDs, model, timestamp, confidence, and status. | `ai_insights` and related audit records. | Long-lived for traceability. | Stores links to source evidence instead of unsupported claims. |
| Quality memory | Tracks analyst approvals, rejections, edits, and recurring low-confidence patterns. | Agency-scoped review history and audit logs. | Long-lived, agency-scoped. | Used to improve future drafts without storing private data outside approved tables. |

### What The Agent Should Remember

- Agency-level analysis preferences explicitly set by authorized users.
- Approved competitor lists for each client or location.
- Which insights were approved, rejected, edited, or marked stale.
- Model name, generation timestamp, confidence, and source evidence for each AI-generated insight.
- Reusable quality patterns such as “low review volume requires cautious language.”

### What The Agent Must Not Remember

- Secrets, API keys, tokens, credentials, or payment data.
- Private messages, login-protected content, employee data, customer exports, or unapproved source data.
- Cross-agency comparisons or patterns derived from another agency’s data.
- Raw personal identifiers beyond the product’s approved storage, such as unhashed author names when hashing is required.
- Unsupported facts, inferred demographics, or claims not tied to source evidence.

---

## 3. Skills

### Core Analytical Skills

1. **Tenant-scoped data selection**  
   Resolve `agency_id`, client, location, user role, date range, and source filters before any analysis. Reject analysis when scope is missing or unauthorized.

2. **Review sentiment classification**  
   Assign positive, neutral, negative, or mixed sentiment from review text and rating context. Include confidence and avoid over-weighting single reviews.

3. **Theme extraction**  
   Identify recurring themes such as service speed, food quality, cleanliness, atmosphere, price perception, delivery issues, staff mentions, wait times, or location-specific concerns.

4. **Trend detection**  
   Compare current review volume, rating movement, and sentiment mix against a prior period selected by the user or product default.

5. **Competitor signal interpretation**  
   Compare configured competitors using permitted public signals only. Flag notable differences with source URLs and observation dates.

6. **Evidence-backed insight drafting**  
   Generate concise titles, summaries, confidence, supporting review IDs, competitor signal IDs, and recommended next actions.

7. **Uncertainty handling**  
   State when evidence is limited, stale, inconsistent, or below the minimum sample threshold.

8. **Human-review routing**  
   Set high-impact or client-facing recommendations to `Needs human review` before publication or export.

9. **Report-ready summarization**  
   Draft approved, client-ready narrative sections for PDF or CSV reports while keeping evidence appendices available.

10. **Auditability**  
   Record insight generation, evidence links, model metadata, user-triggered actions, approval status, and changes in the audit log.

### Tooling The Agent Needs

| Tool | Purpose | Required Guardrail |
| --- | --- | --- |
| Tenant Scope Resolver | Confirms active `agency_id`, role, client, location, and date range. | Blocks every downstream action if scope is invalid. |
| Review Query Tool | Reads approved reviews for scoped clients and locations. | Requires `agency_id` and authorized source status. |
| Review Deduplication Tool | Groups duplicate or near-duplicate reviews from imports and source syncs. | Preserves source IDs and collection timestamps. |
| Sentiment Analysis Tool | Classifies sentiment and confidence for review batches. | Uses collected evidence only. |
| Theme Extraction Tool | Finds repeated themes and representative evidence. | Requires minimum sample thresholds. |
| Trend Comparison Tool | Compares review, rating, and sentiment movement over time. | Shows date windows and sample counts. |
| Competitor Signal Tool | Reads approved competitor activity and public signal notes. | Uses configured competitors only. |
| Insight Draft Tool | Produces title, summary, confidence, evidence links, and suggested next action. | Stores drafts as `Needs human review` when advice could affect client strategy. |
| Evidence Link Tool | Maps insight claims to review IDs, URLs, and competitor signal IDs. | Blocks unsupported claims. |
| Report Section Tool | Drafts report-ready sections from approved insights. | Requires approved insight status for client-facing export. |
| Audit Log Tool | Records analysis runs, generated insights, approvals, rejections, and exports. | Writes agency-scoped audit entries. |

---

## 4. Agent

### Agent Definition

The Review Insight Analyst Agent is an internal product agent that monitors approved restaurant review and competitor data for each agency workspace. It identifies meaningful changes, drafts explainable insights, and routes recommendations to Managers or Analysts for review.

### Primary Goal

Help agency teams move from raw review volume to client-ready decisions while preserving tenant isolation, source compliance, and human oversight.

### Inputs

- Active `agency_id` and authorized user role.
- Client, location, source, competitor, and date range filters.
- Approved public reviews or authorized review imports.
- Agency-configured competitor records and permitted public competitor signals.
- Existing insight history and approval status.
- Report builder context when available.

### Outputs

- Insight drafts with title, summary, confidence, status, source evidence, and model metadata.
- Sentiment and theme summaries for dashboards.
- Competitor activity notes tied to configured competitors.
- Report-ready narrative sections from approved insights.
- Audit log entries for traceability.
- In-app queue items marked `Needs human review`.

### Continuous Analysis Workflow

1. **Trigger**  
   Run after an approved import, scheduled source sync, manual analysis request, or report builder request.

2. **Authorize and scope**  
   Resolve signed-in user, role, active `agency_id`, client, location, source, competitor, and date range.

3. **Read approved data**  
   Query reviews and competitor signals only from authorized, agency-scoped records.

4. **Normalize and deduplicate**  
   Remove duplicates, preserve source references, and calculate sample counts.

5. **Analyze sentiment and themes**  
   Classify sentiment, identify repeated themes, and calculate confidence from evidence quality and volume.

6. **Detect changes**  
   Compare current data with the selected prior period and configured competitors.

7. **Draft insights**  
   Produce concise summaries with supporting evidence, confidence, and recommended next action.

8. **Store separately from sources**  
   Save AI-generated insight drafts to `ai_insights` with model, timestamp, confidence, evidence IDs, and status.

9. **Route for review**  
   Place high-impact or client-facing insights in the `Needs human review` queue.

10. **Audit**  
   Write an agency-scoped audit log entry for each analysis run, generated insight, approval, rejection, or report use.

### Allowed Actions

- Analyze approved public reviews and authorized imports within the active agency.
- Summarize sentiment, themes, rating movement, review volume, and source coverage.
- Compare scoped restaurant locations with configured competitors using permitted public signals.
- Draft insight titles, summaries, confidence labels, supporting evidence, and suggested next actions.
- Mark insight drafts as `Needs human review`.
- Generate dashboard summaries for authorized users.
- Draft report sections from approved insights and scoped evidence.
- Explain which reviews or signals support a claim.
- Log analysis runs, generated drafts, and user review actions.
- Say when data is insufficient, stale, conflicting, or low confidence.

### Forbidden Actions

- Read, infer, export, summarize, or train from data outside the active `agency_id`.
- Scrape websites without explicit permission, bypass terms, ignore robots.txt, or collect login-protected content.
- Use private messages, contact details, payment data, employee data, customer exports, sensitive personal information, secrets, or unapproved raw data.
- Invent reviews, statistics, competitor facts, source links, or business performance claims.
- Present high-impact recommendations as final business advice without human review.
- Publish client-facing reports from unapproved insight drafts.
- Change source connections, source allowlists, collection schedules, tenant rules, or AI prompt policy without approval.
- Send external alerts through Slack, email, SMS, or similar channels in v1.
- Store unhashed personal identifiers when the schema requires hashed display names.
- Hide low confidence, missing source coverage, or limited sample sizes.

### Risks And Safeguards

| Risk | Safeguard |
| --- | --- |
| Cross-tenant data exposure | Require `agency_id` in every query, prompt payload, export, report, and audit log. Add tests that prove Agency A cannot read or infer Agency B data. |
| Unsupported AI claims | Generate insights only from collected evidence. Require source review IDs or competitor signal IDs for each claim. |
| Unauthorized collection | Use approved APIs, partner exports, CSV imports, or clearly permitted public pages only. Block unapproved source types. |
| Low sample-size overstatement | Set minimum thresholds, display sample counts, and use cautious language when evidence is limited. |
| Client-facing advice without review | Route strategic recommendations and report narratives to `Needs human review` before publication. |
| Prompt injection from review text | Treat review text as untrusted data, not instructions. Strip commands and never let review content change system rules. |
| Sensitive data retention | Store only approved fields, hash author display names as required, and avoid memorizing private identifiers. |
| Stale competitor signals | Show `observed_at`, source URL, and freshness warnings for competitor data. |
| Duplicate imports | Deduplicate by source, external ID, text similarity, location, and published date while preserving evidence links. |
| Model drift or quality decline | Store model name, timestamp, confidence, status, and analyst feedback for quality review. |
| Poor explainability | Require every insight to include evidence links, confidence, and source context. |
| Role misuse | Enforce role permissions: Viewer/Client can read approved outputs only; Analyst can edit drafts; Manager can approve; Owner/Admin can configure agency settings. |

### Human Approval Points

Human approval is required before:

- Publishing an AI-generated insight to a client-facing dashboard or report.
- Presenting high-impact recommendations as business advice.
- Exporting a report section that includes AI-generated narrative or recommendations.
- Adding or changing review sources, competitor source rules, or collection schedules.
- Changing tenant isolation logic, role permissions, prompt policy, or confidence thresholds.
- Using a new category of public data or a new provider integration.
- Sending any external notification or alert outside the application.
- Reprocessing rejected insights as approved recommendations.

### Acceptance Criteria

- The agent always resolves and enforces `agency_id` before analysis.
- Generated insights include title, summary, confidence, status, model, timestamp, and source evidence.
- High-impact recommendations are stored as drafts with `Needs human review`.
- The agent refuses unsupported claims and identifies low-confidence conditions.
- Viewer/Client users can only see approved outputs.
- Reports use approved insights and include an evidence appendix.
- All analysis runs and status changes are audit logged.
