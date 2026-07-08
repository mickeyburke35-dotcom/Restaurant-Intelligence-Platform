# Product Evaluation

Feature under evaluation: Review Insight Generation and related review import/report workflows.

Source of truth: `PRD.md`, `AI_BEHAVIOUR.md`, `AGENT_BLUEPRINT.md`, `ARCHITECTURE.md`, and `prisma/schema.prisma`.

## Scenario 1: Bad Input Scenario

**User goal:** As an Analyst, test whether the product rejects an unapproved or incomplete review import before AI insight generation.

**Exact steps:**

1. Sign in as an Analyst in a seeded agency workspace.
2. Open the Reviews screen for one restaurant client.
3. Start a CSV review import.
4. Upload a file missing required source or published date fields.
5. Include at least one row with unsupported private or login-protected source notes.
6. Attempt to continue to insight generation.

**Expected behaviour:**

- The import is rejected or held for correction before reviews are used.
- The screen identifies missing required fields in user-safe language.
- Unsupported source content is not saved as approved review evidence.
- No insight generation job starts from the rejected data.
- Existing agency data remains unchanged except for any safe audit entry.

**Measurable success criterion:**

100% of invalid rows are blocked from insight generation, and the user sees a clear correction path within one screen.

**Evidence to capture:**

- Screenshot of validation message.
- Import attempt audit log entry.
- Example rejected row identifiers with no private data.
- Confirmation that no `INSIGHT_GENERATION` job was created for the invalid upload.

**Run log:**

| Run date | Tester | Result | Notes | Evidence link |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Scenario 2: Mid-Flow Abandon Scenario

**User goal:** As a Manager, confirm that leaving insight generation mid-flow does not approve, publish, or lose draft work unexpectedly.

**Exact steps:**

1. Sign in as a Manager.
2. Open the Insights screen for a restaurant client with approved reviews.
3. Select a location and a 30-day date range.
4. Click Generate Insights.
5. Wait until draft insight cards appear.
6. Navigate away before approving, rejecting, or editing any insight.
7. Return to the same client and date range.

**Expected behaviour:**

- Generated insights remain in `DRAFT` or `NEEDS_REVIEW` status.
- No insight is marked `APPROVED` without explicit reviewer action.
- Returning to the flow shows the saved drafts or a clear status message.
- Source review links, confidence, timestamp, and model metadata remain available.

**Measurable success criterion:**

0 drafts are auto-approved, and the Manager can resume review with all generated evidence visible.

**Evidence to capture:**

- Screenshot before leaving the flow.
- Screenshot after returning.
- Insight status values before and after abandon.
- Audit log entries for generation and any status changes.

**Run log:**

| Run date | Tester | Result | Notes | Evidence link |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Scenario 3: AI Hallucination Risk Scenario

**User goal:** As an Analyst, verify that the AI does not make unsupported claims when evidence is sparse, conflicting, or competitor data is absent.

**Exact steps:**

1. Sign in as an Analyst.
2. Open a restaurant client with fewer than five approved reviews in the selected date range.
3. Confirm there are no selected competitor observations for the same date range.
4. Click Generate Insights.
5. Review generated titles, summaries, sentiment, themes, confidence, and source references.
6. Attempt to approve any insight that includes a statistic or competitor comparison without source evidence.

**Expected behaviour:**

- The AI labels sparse evidence as low confidence or insufficient evidence.
- The AI does not invent statistics, market claims, source links, or competitor performance.
- Unsupported competitor comparison claims are omitted or blocked.
- Approval is blocked or reviewer guidance appears when source review links are missing.

**Measurable success criterion:**

Every generated claim is traceable to at least one source review or approved competitor observation, and unsupported claims have a 0% approval rate.

**Evidence to capture:**

- Prompt input summary with agency/client/location/date scope.
- Generated insight cards.
- Source review reference list.
- Any blocked approval message.
- Reviewer notes explaining rejected unsupported claims.

**Run log:**

| Run date | Tester | Result | Notes | Evidence link |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Scenario 4: Normal Review Import Scenario

**User goal:** As a Manager, import approved public review data and generate review insights for a client dashboard.

**Exact steps:**

1. Sign in as a Manager.
2. Open a restaurant client and choose one active location.
3. Start a review import from an approved CSV or permitted API source.
4. Map source, rating, review text, review URL, published date, and location fields.
5. Complete the import.
6. Open the Insights screen for the same client, location, and date range.
7. Click Generate Insights.
8. Review the draft insights and approve one evidence-backed insight.

**Expected behaviour:**

- Imported reviews are stored with the correct `agency_id`, restaurant, location, review source, rating, review text, review URL, published date, and collected date.
- Duplicate reviews are handled by source and external ID.
- Insight generation uses only the selected tenant-scoped approved reviews.
- Draft insight cards include title, summary, sentiment, themes, confidence, source review references, timestamp, model, and approval status.
- Approved insight status changes only after the Manager action.

**Measurable success criterion:**

The Manager can import valid review data, generate traceable drafts, and approve one insight in under 10 minutes using seeded demo data.

**Evidence to capture:**

- Import summary screen.
- Review table filtered to the imported date range.
- Generated insight detail with source references.
- Approved insight status and reviewer metadata.
- Audit log for import, generation, and approval.

**Run log:**

| Run date | Tester | Result | Notes | Evidence link |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Scenario 5: Report Export Scenario

**User goal:** As a Manager, export a client-ready PDF or CSV report using approved review insights.

**Exact steps:**

1. Sign in as a Manager.
2. Open Reports for a restaurant client.
3. Select one or more active locations and a date range with approved reviews.
4. Choose PDF, CSV, or both if the UI supports both in the current build.
5. Select report sections for KPI summary, charts, approved insight narrative, and evidence appendix.
6. Confirm that approved-only insight filtering is active.
7. Generate the report.
8. Open the signed download URL as the same Manager.
9. Attempt to open the same report as a user from another agency.

**Expected behaviour:**

- The report includes only the selected agency, client, location, date range, and approved insights.
- Draft, rejected, archived, or unreviewed insights are excluded unless clearly exported as an internal draft.
- The export status moves through queued or generating states to ready, or shows a safe failure message.
- The file is stored privately and served through a signed URL.
- A user from another agency cannot access, infer, or download the report.

**Measurable success criterion:**

100% of exported report content matches the selected tenant scope and date range, and cross-agency download attempts are denied.

**Evidence to capture:**

- Report setup screen.
- Export status history.
- Downloaded PDF or CSV sample with no private data.
- Signed URL access result for permitted user.
- Denied access result for cross-agency user.
- Audit log for report generation and download attempt.

**Run log:**

| Run date | Tester | Result | Notes | Evidence link |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
