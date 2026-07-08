# Session 20 Hugging Face Scan

These Hugging Face findings are research references only; none of these are currently implemented in the Restaurant Intelligence Platform app.

| Item | What you found | Why it fits the Restaurant Intelligence Platform |
| --- | --- | --- |
| Model | `sentence-transformers/all-MiniLM-L6-v2`; purpose: sentence embeddings, clustering, and semantic search; license: Apache 2.0. | It could help group similar imported reviews and support semantic search across review text, but it has not been evaluated inside the product. |
| Dataset | `yashraizad/yelp-open-dataset-reviews`; purpose: large Yelp-style review dataset with stars, text, date, `business_id`, and `user_id`; license: Apache 2.0. | It is useful as a reference for review structure, sentiment labels, star ratings, and restaurant feedback patterns without claiming current customer traction or production coverage. |
| Space | `nazianafis/Sentiment-Analysis`; purpose: browser demo for text sentiment analysis using Transformers. | It is a useful UX reference for displaying quick review sentiment output and a confidence score in a clear analyst-facing workflow. |
| Risk / limitation | The model, dataset, and Space are reference candidates only; none are production features today. | Restaurant Intelligence Platform would still need tenant-scoped implementation, source-review traceability, licensing review, bias checks, cost controls, and reliability testing before adoption. |
