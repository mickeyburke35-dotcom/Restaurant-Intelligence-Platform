# Session 19 Demo Script

## Problem Statement

Hospitality agencies and consultants need a controlled way to turn approved public restaurant reviews into client-ready analysis without mixing agency data, overstating sparse evidence, or letting AI output become business advice before a person reviews it.

This demo shows the documented/local review-to-report workflow only. It does not claim live provider coverage, customer traction, unattended publishing, or full production operation.

## Three-Minute Live Demo Order

| Time | Demo step | What to say or show |
| --- | --- | --- |
| 0:00-0:25 | Open with the problem | Agencies manage many restaurants, locations, sources, and reports. The risk is not only speed; it is unsupported claims and cross-client data exposure. |
| 0:25-0:50 | Show imported approved reviews | Start from reviews that are already imported from an approved source or approved demo CSV. Point out restaurant, location, source, date, rating, sentiment, and evidence text. |
| 0:50-1:15 | Select reviews for analysis | On the insight review flow, select one restaurant, optional location, and a small set of review records. Emphasize that Gemini receives selected review evidence, not the whole database. |
| 1:15-1:45 | Generate draft insight | Trigger draft insight generation. Show title, summary, sentiment, themes, confidence, model, prompt version, generated timestamp, and source review count. |
| 1:45-2:10 | Verify evidence | Open the supporting review excerpts. Explain that each claim must map back to selected reviews, and that low confidence or missing evidence blocks a polished recommendation. |
| 2:10-2:35 | Human approval gate | Approve or reject one draft with a short reviewer note. Show that the system records reviewer and decision timestamp, and that reviewed insights are locked. |
| 2:35-3:00 | Create report snapshot | Move to reports and create or open a report built from approved insights only. State that draft and rejected insights are excluded from reports. |

## Closing Line

The core loop is controlled evidence work: imported reviews become selected evidence, Gemini drafts an insight, verification and human review decide whether it can appear in a report.
