---
name: Docker is dev-only
description: Both Dockerfiles are a single stage that runs npm run dev against a bind mount; there are no production builds or images
metadata:
  type: project
---

Docker Compose runs each service in a single dev stage against a bind mount. There are no
production stages, no web server config, and no build/start scripts in the API.

**Why:** this is a demo with no deployment target, so a dev/prod split only adds weight. `tsc`
doesn't rewrite the `@src/*`-style aliases, so compiled output couldn't run without an extra
tool like `tsc-alias`.

**How to apply:** don't add production stages, a compile step, or alias-rewriting tools unless
a deployment is asked for.
