# Agent Team Handoff

## Session 12 Exercise

This document records the Session 12 Agent Team handoff exercise using the PopStop course structure. It is a design-only artifact for planning how specialized agents would pass work from strategy to launch approval.

No agents, app features, API routes, background jobs, database changes, or integrations are built from this document.

## Objective

The team produces an approved launch pack by moving through four specialist agents:

1. Segment Strategy Agent
2. Landing Page Agent
3. Outreach Email Agent
4. Scoring / Kill-Gate Agent

The launch pack is approved only when the Scoring / Kill-Gate Agent assigns a score of 95/100 or higher.

## Shared Rules

- Work only from user-provided product, market, and course materials.
- Do not invent customer evidence, claims, metrics, testimonials, or competitor information.
- Keep claims specific, supportable, and tied to the provided inputs.
- Treat every output before the final gate as draft material.
- Require human review before launch materials are published or sent.
- If evidence is missing, mark the gap and request the input instead of filling it in.

## Handoff Order

1. Human owner provides the product brief, course constraints, target market notes, and any evidence.
2. Segment Strategy Agent creates the segment strategy brief.
3. Landing Page Agent uses the approved segment strategy brief to draft the landing page.
4. Outreach Email Agent uses the segment strategy brief and landing page draft to create the email campaign.
5. Scoring / Kill-Gate Agent reviews the full pack and scores it against the 100-point rubric.
6. If the score is below 95/100, the Scoring / Kill-Gate Agent returns required revisions to the responsible agent.
7. If the score is 95/100 or higher, the pack moves to human approval as the final approved launch pack.

## Agent Specifications

### Segment Strategy Agent

| Field | Definition |
| --- | --- |
| Role | Identifies and narrows the launch audience into one specific, reachable, high-fit segment. |
| Task | Review candidate segments, select the strongest launch segment, define buyer context, clarify pain, map objections, and identify proof needed for launch messaging. |
| Model / reasoning level | High-reasoning model; high reasoning level. |
| Required inputs | Product or offer brief, target market notes, known customer pains, user research, competitor notes, pricing assumptions, channel constraints, banned claims, launch goal. |
| Expected outputs | Segment strategy brief with primary segment, backup segment, buyer persona, problem statement, trigger events, desired outcome, objections, proof gaps, messaging angles, acquisition channels, disqualifiers, assumptions, and confidence level. |

### Landing Page Agent

| Field | Definition |
| --- | --- |
| Role | Turns the segment strategy into a clear landing page narrative for the selected audience. |
| Task | Draft page structure and copy that presents the problem, offer, proof, objections, and call to action for the chosen segment. |
| Model / reasoning level | Copy-focused model; medium reasoning level. |
| Required inputs | Approved segment strategy brief, product or offer details, brand voice, proof assets, screenshots or demo notes if available, pricing or waitlist details, primary call to action, compliance constraints. |
| Expected outputs | Landing page draft with hero headline, subheadline, primary CTA, problem section, offer section, benefits, proof or evidence blocks, objection handling, FAQ, risk notes, and final CTA. |

### Outreach Email Agent

| Field | Definition |
| --- | --- |
| Role | Creates direct outreach messages that match the approved segment and landing page promise. |
| Task | Draft a short outbound email sequence that opens a relevant conversation and drives the recipient toward the landing page or reply CTA. |
| Model / reasoning level | Copy-focused model; medium reasoning level. |
| Required inputs | Approved segment strategy brief, landing page draft, sender identity, recipient persona, outreach channel, offer details, personalization fields, compliance constraints, reply goal. |
| Expected outputs | Outreach sequence with subject lines, first email, follow-up emails, personalization tokens, CTA, segmentation notes, reply handling guidance, and risk flags for unsupported claims. |

### Scoring / Kill-Gate Agent

| Field | Definition |
| --- | --- |
| Role | Reviews the complete launch pack, enforces the quality gate, and decides whether to approve, revise, or stop the launch. |
| Task | Score the segment, landing page, and outreach sequence against the rubric; identify weak points; assign revision requests; approve only when the pack reaches 95/100 or higher. |
| Model / reasoning level | High-reasoning model; high reasoning level. |
| Required inputs | Segment strategy brief, landing page draft, outreach email sequence, source inputs, evidence notes, compliance constraints, scoring rubric, prior revision history if any. |
| Expected outputs | Scorecard with total score, category scores, pass/revise/kill decision, required changes, owner for each change, evidence gaps, risk notes, and final approval status. |

## 95/100 Scoring Gate

The Scoring / Kill-Gate Agent grades the launch pack out of 100 points.

| Category | Points |
| --- | ---: |
| Segment specificity and reachability | 20 |
| Problem urgency and buyer motivation | 15 |
| Offer clarity and fit | 15 |
| Evidence quality and claim support | 15 |
| Landing page clarity and conversion logic | 15 |
| Outreach relevance and reply potential | 10 |
| Compliance and risk control | 5 |
| Launch readiness | 5 |
| Total | 100 |

Gate decisions:

- 95-100: Approved for human final review.
- 90-94: Revision required before approval.
- 75-89: Major revision required; return to the weakest upstream agent.
- Below 75: Kill-gate triggered unless the human owner supplies materially stronger inputs.

The pack cannot be called final or launch-ready unless it scores at least 95/100 and a human owner approves the final version.

## Final Approved Launch Pack Output

The final approved launch pack includes:

- Final segment strategy brief.
- Final landing page copy and structure.
- Final outreach email sequence.
- Scoring / Kill-Gate scorecard showing at least 95/100.
- Revision history summary.
- Evidence and assumptions list.
- Risk and compliance notes.
- Human approval note for launch readiness.

The launch pack remains a course exercise deliverable until a human owner separately approves any real launch activity.
