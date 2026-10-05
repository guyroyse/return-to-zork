---
name: Agents see graph links as plain properties; the arbiter owns movement
description: Entity JSON must carry the links agents reason about (player roomId, door leadsTo) and no instanceId; only the arbiter moves the player
metadata:
  type: project
---

Links that live only as Neo4j relationships never reach the LLM. Without them, moves fail
intermittently and each agent tells the other to handle the move.

**Why:** an agent can't use a link it can't see. An agent's recommendation can only change its
own entity, so a door agent can't move the player and the player agent can't see doors; movement
needs one node with all the facts, so the arbiter sees every nearby entity and runs every turn.
`instanceId` is left out of entity JSON because door agents will use that UUID as an entityId.
Asking the narrator for "atmospheric, immersive" text makes it invent details and exits the data
doesn't support.

**How to apply:** when changing entity JSON or agent prompts, keep `roomId`/`leadsTo` visible,
keep `instanceId` out, and keep movement in the arbiter (only when the command matches a door
here). Keep the narrator to what's in the entities and applied changes; don't make it fanciful again.
