---
name: External dependencies live in accessors/
description: Code that talks to anything outside the app (Neo4j, KurrentDB, OpenAI, world files) goes in api/src/accessors/; only domain classes call it, services go through the domain
metadata:
  type: project
---

Anything that talks to something outside the app goes under `api/src/accessors/<dependency>/`.
Only domain classes call accessors; services and routes go through the domain.

**Why:** they're external dependencies, not all databases, so `db` was the wrong name. The name
comes from IDesign's "resource accessors" (Löwy's Method), chosen over `adapters` (implies
ports), `infra`, and `gateways`. Only the name was borrowed, not the Method: the domain stays
active record, with entities running Cypher themselves.

**How to apply:** if a service needs an accessor, add a domain class for it. Don't restructure
other folders into managers/engines tiers unless asked.
