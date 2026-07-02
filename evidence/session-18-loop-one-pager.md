# Session 18 Loop One-Pager

## Anthropic Pattern

Anthropic pattern: evaluator-optimizer workflow.

The loop uses one agent or service to draft an insight, then a verifier evaluates the draft against source evidence and sends it back for revision until the output meets the evidence bar or reaches the stop condition.

## Eight-Field Loop Canvas

| Field | Restaurant Intelligence Platform loop |
| --- | --- |
| 1. Goal | Turn imported, approved restaurant reviews into a draft client insight that is concise, evidence-linked, tenant-scoped, and ready for human review. |
| 2. Trigger | A Manager or Analyst selects a restaurant, location or date range, then starts insight generation after reviews have been imported from an approved source or CSV. |
| 3. Skill used | Review Insight Generation: classify sentiment, identify recurring themes, draft a short insight, assign confidence, and attach source review references. |
| 4. Agent that executes | Review Insight Analyst Agent, running through the backend AI service and constrained by agency, client, location, date range, source approval status, and role permissions. |
| 5. Memory/state read or written | Reads tenant-scoped reviews, ratings, review source metadata, restaurant/location context, selected competitor observations if available, and existing AI behavior rules. Writes a separate `ai_insights` draft record with model, timestamp, confidence, source review IDs, status, and audit metadata. |
| 6. Verifier | Evidence verifier checks that every claim maps to approved source reviews or competitor signal records, source links belong to the same `agency_id`, confidence matches sample quality, prompt-injection text was ignored, and no unsupported statistics, market claims, or recommendations were added. |
| 7. Stop condition | Stop when the verifier marks the draft as evidence-supported and tenant-safe, or after two failed revision attempts, or when source data is insufficient. On insufficient data, store or return a low-confidence/needs-more-evidence state instead of a polished recommendation. |
| 8. Human gate | A Manager reviews the verified draft, source evidence, confidence, and model metadata before approving it for reports or client-facing dashboard use. High-impact recommendations remain "Needs human review" until approved. |

## Loop Summary

1. Imported approved reviews enter the tenant-scoped review store.
2. The AI service drafts an insight only from reviews and source context inside the active agency scope.
3. The verifier evaluates evidence coverage, source links, confidence, tenant isolation, and unsupported claims.
4. If the verifier rejects the draft, the optimizer revises using the same approved evidence only.
5. If the draft still fails after the stop condition, the system preserves a pending or insufficient-evidence state.
6. A Manager approves or rejects the verified draft before it becomes client-facing business advice.

