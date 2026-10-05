# Return to Zork

## What this project is

An AI-backed game that demos LangGraph.js.

## Demo code

This project is trimmed down to its essentials for a demo. Error handlers, explanatory comments, and defensive checks are left out on purpose.

- Don't flag their absence as a mistake or add them back.
- Keep additions minimal.

## Memory

Auto memory is off for this project. Memories live in `.claude/memories/` instead, indexed in `.claude/memories/MEMORY.md`, which is imported below.

- Save a memory when you learn something future sessions will need that the code, git history, and this file don't already say: the user's preferences, corrections and approaches they confirm, ongoing work and decisions, or where to find outside resources.
- Record the why, not the what. Don't describe the code: file paths, class and method names, API shapes, and rename history go stale and can be read from the code. Keep the reason for a decision, alternatives rejected, preferences, and rules a future session might otherwise break. If deleting a sentence loses nothing that reading the code wouldn't recover, delete it.
- Write one memory per file, with a short kebab-case filename and frontmatter holding `name`, `description`, and `metadata.type` (`user`, `feedback`, `project`, or `reference`). Follow a `feedback` or `project` fact with **Why:** and **How to apply:** lines.
- List each memory in `MEMORY.md` as one line, and update or delete memories that change or turn out to be wrong.
- Write dates as absolute dates, not relative ones.
- Memories are checked into the repo and shared, so don't name or refer to any particular person. Write decisions and preferences as the project's.
- Describe the present implementation, not how it got here. Don't mention technologies the project used to use or tell what was replaced or removed; alternatives considered and rejected are fine as reasons.

@.claude/memories/MEMORY.md
