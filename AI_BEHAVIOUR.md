# AI Behaviour Specification

## Feature

Review Insight Generation

## Trigger

A Manager or Analyst clicks "Generate Insights" after selecting a restaurant and date range.

## Input

- Approved public restaurant reviews
- Ratings
- Review source
- Review date
- Restaurant location
- Selected competitor observations, if available

## AI Processing

The AI analyzes selected reviews to classify sentiment, identify recurring themes, generate concise draft insights, assign a confidence level, and link each insight back to source reviews.

## Output

Draft insight cards containing:

- Title
- Summary
- Sentiment
- Themes
- Confidence
- Source review references
- Timestamp
- Model
- Approval status

## Where it Lives

Backend AI service using the OpenAI API.

## Success Criteria

- Every generated insight links back to supporting reviews.
- Low-confidence insights are clearly identified.
- AI-generated insights remain drafts until approved by a human reviewer.
- No unsupported or fabricated information is presented.

## Evidence

Use the Stitch AI Insight Review screen PNG as design evidence for Session 11.
