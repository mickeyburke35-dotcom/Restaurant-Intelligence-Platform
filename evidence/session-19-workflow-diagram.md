# Session 19 Workflow Diagram

## Review Insight Workflow

```mermaid
flowchart LR
  A["Imported reviews<br/>approved public review records"] --> B["Selected reviews<br/>restaurant, location, date, review IDs"]
  B --> C["Gemini insight generation<br/>draft JSON from selected evidence"]
  C --> D["Verifier<br/>schema, source IDs, evidence, confidence, tenant scope"]
  D --> E["Draft insight<br/>DRAFT status with source links"]
  E --> F["Human approval<br/>approve or reject with reviewer note"]
  F --> G["Approved insight<br/>reviewer and timestamp recorded"]
  G --> H["Report<br/>approved insight snapshot"]

  D --> I["Stop or return no insight<br/>Gemini failure, low confidence, or missing evidence"]
  F --> J["Rejected insight<br/>excluded from reports"]
```

## Control Notes

- The verifier step is a control step in the documented workflow. In the current code path, controls include JSON schema validation, selected-review ID checks, source evidence links, confidence handling, tenant-scoped queries, and human review.
- Gemini generation is limited to selected imported reviews and should not produce competitor analysis or report narratives in this step.
- Draft and rejected insights do not enter report snapshots.
- Approved insights enter reports only after a human decision is recorded.
