---
name: no-barrel-files
description: No index.ts barrel files; import each module from its own file
metadata:
  type: feedback
---

Don't create `index.ts` files, barrel or otherwise. Give each module a descriptive filename and import directly from it.

**Why:** barrel imports clutter up the namespaces across the project.

**How to apply:** when adding a module or folder, name the file for what it holds and have callers import that file; `web/index.html` is the one exception, since Vite needs it.
