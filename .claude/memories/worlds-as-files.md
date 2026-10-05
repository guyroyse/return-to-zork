---
name: Worlds are files loaded at startup
description: Authored worlds are JSON files in worlds/, read into memory once at API startup; "world" means authored content, "game" means a live copy
metadata:
  type: project
---

The API owns the authored worlds, loading them from files at startup.

**Why:** a handful of small read-only files doesn't need a database (Mongo was rejected as
overkill), and worlds must stay out of Neo4j, which holds only live game state. Loading at
startup fails fast on a bad world; adding one means restarting the API.

**How to apply:** use "world" for authored content and "game" for a live copy of one; call the
Neo4j state "the game graph", never "the world graph" or "template".
