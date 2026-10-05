---
name: Hash routing, hand-rolled
description: The web UI routes on location.hash with a small hand-written router, not a router library or in-memory routes
metadata:
  type: project
---

The web UI uses hash routing, implemented by hand rather than with a library.

**Why:** a refresh or the back button mid-demo should keep the player in their game. Third-party routers for plain Svelte (non-Kit) have proven unreliable, so a library is ruled out, but a dozen hand-written lines avoid that problem. It's treated as an experiment.

**How to apply:** don't add svelte-spa-router or similar, and don't move to SvelteKit for routing. If the hand-rolled router causes trouble, raise it rather than swapping it out.
