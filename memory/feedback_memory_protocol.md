# Memory Protocol

When the user corrects Codex or asks Codex to remember something about this project, save it as its own Markdown file in the root `memory/` folder if it would change how Codex should behave in a future session.

Use these filename prefixes:

- `user_` for how the user personally works.
- `project_` for rules about this specific project.
- `feedback_` for corrections to Codex behavior.
- `reference_` for links, facts, or external context.

Keep `memory/MEMORY.md` as an index of every saved rule with a one-line summary, so the right rule can be loaded next session.

Also maintain:

- `memory/lessons.md` as a narrative log of strategic learnings.
- `tasks/todo.md` as the current sprint work tracker.

At the start of every new session, read `memory/MEMORY.md`, `memory/lessons.md`, and `tasks/todo.md`.

Save the pattern that prevents a future mistake, not the one instance that caused it. Do not save a rule unless it would change future behavior.
