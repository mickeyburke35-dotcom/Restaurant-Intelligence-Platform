---
name: post-push-security-audit
description: Run a post-GitHub-push security audit for the Restaurant Intelligence Platform before opening or merging a pull request. Use after a branch is pushed to GitHub and the agent must check the pushed diff for secrets, private information, accidental environment files, screenshots with exposed secrets, unrelated coursework artifacts, generated files, and unintended changes.
---

# Post-Push Security Audit

## Purpose

Protect the Restaurant Intelligence Platform repo after every GitHub push by checking the pushed diff for private data, secrets, unrelated files, and accidental artifacts before a pull request is opened or merged.

## When To Use

Use this skill after every successful push to GitHub and before opening, approving, or merging a pull request.

Do not use it as a substitute for application tests, tenant-isolation tests, or code review. It is a security and repository-hygiene audit focused on the pushed diff.

## Inputs

- Repository root.
- Current branch name.
- Origin or pull request base branch.
- Latest pushed commit SHA or diff range.
- Optional screenshots or generated evidence files included in the pushed diff.
- Project rules from `AGENTS.md` and `README.md`.

## Steps

1. Identify the base branch and current branch.
2. Inspect the pushed diff against the origin base branch.
3. List every changed, added, deleted, or renamed file.
4. Search the diff and changed files for common secrets and private values.
5. Confirm `.env` files are ignored and not committed.
6. Review screenshots, rendered assets, and evidence files for exposed secrets or private data.
7. Confirm no unrelated PopStop or Videoreport artifacts are included in the Restaurant Intelligence repo.
8. Confirm the changed files match the intended scope of the pushed work.
9. Report pass or fail.
10. If findings exist, recommend immediate remediation before PR creation or merge.

## Checks

The audit must include these checks:

- `git diff` against the origin base branch.
- Secret terms: `GOOGLE_AI_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `AUTH_SESSION_SECRET`, `github_pat_`, `sk-`, and `AIza`.
- `.env` and environment-file tracking status.
- Screenshot or image exposure risk when screenshots are part of the diff.
- Unrelated coursework artifact names, especially PopStop and Videoreport.
- Generated files that do not belong in the PR.
- Intended-file confirmation against the task request.
- Tenant-sensitive files, such as Prisma schema, auth helpers, tenant query helpers, AI prompts, and exports, when they appear in the diff.

## Failure Avoidance

- Do not mark the audit as passed without listing the files checked.
- Do not inspect only the working tree if the requirement is to audit a pushed branch.
- Do not print secret values into the report. If a secret is found, identify the file and line or pattern without repeating the full value.
- Do not ignore screenshots, PDFs, or generated evidence files.
- Do not assume a generated file is safe because it is not source code.
- Do not approve a PR when the diff includes unrelated coursework artifacts or private data.
- Do not claim production readiness as part of this audit.

## Required Output

Report:

- Pass/fail result.
- Diff range or base branch checked.
- Files checked.
- Secret search terms used.
- Findings, if any.
- Screenshot or generated-artifact review result.
- Confirmation that `.env` is ignored and not committed.
- Confirmation that no unrelated PopStop or Videoreport artifacts are present.
- Confirmation that only intended files changed, or a list of unexpected files.
- Immediate remediation steps before merge if the result is fail.

## Rerun Evidence Showing Equivalent Quality

Equivalent-quality reruns must produce the same audit shape even when the changed files differ. A valid rerun includes:

| Evidence item | Required quality bar |
| --- | --- |
| Diff scope | Names the base branch or diff range and explains what was checked. |
| File inventory | Lists all checked files, including docs, code, images, generated files, and evidence artifacts. |
| Secret search | Uses the required terms from the project checklist and reports results without exposing secret values. |
| Environment files | Confirms `.env` is ignored and no environment file was committed, or fails with remediation. |
| Screenshot review | Reviews screenshots or states that none were in scope. |
| Coursework artifacts | Confirms no unrelated PopStop or Videoreport artifacts are present. |
| Intended scope | Compares changed files to the user's request and flags unrelated changes. |
| Decision | Reports pass/fail and blocks PR creation or merge on unresolved findings. |

No GitHub push occurred during the creation of this Session 18 artifact, so this file documents the reusable skill and its rerun evidence standard rather than claiming an audit run was completed.

