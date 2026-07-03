# Session 20 Strategic Note

## Opportunity

Sentence embeddings could add a semantic layer to Restaurant Intelligence Platform by helping agency teams cluster similar public reviews, search for related customer complaints, and compare themes across restaurant clients after approved review import. The Yelp-style reference dataset can help shape review data assumptions, while the sentiment demo offers a compact UX reference for showing sentiment and confidence without requiring users to inspect every raw review first.

## Threat

If Restaurant Intelligence Platform adopts external model or dataset patterns too quickly, it could introduce unclear licensing, biased sentiment behavior, higher inference or storage costs, and unreliable results for restaurant-specific language. Any future use must avoid treating benchmark or demo behavior as evidence of product performance.

## Design Implication

Future AI review features should expose semantic clusters, sentiment, confidence, and source-review links as analyst aids, not final business advice. The product should keep every generated insight tenant-scoped, traceable to imported public source reviews, and subject to human review before it appears in client-ready recommendations or reports.
