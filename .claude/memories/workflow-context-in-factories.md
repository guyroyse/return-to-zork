---
name: Workflow nodes get game context from factories, not graph state
description: Nodes capture the Game via factories and fetch nearby entities when they run; graph state holds only per-turn data
metadata:
  type: project
---

Nodes are factories that capture the game and fetch its nearby entities live when they run;
graph state holds no entity snapshot.

**Why:** a snapshot taken at build time would go stale mid-turn. The committer moves the player, so a
narrator holding a snapshot would describe the new room but list the old room's exits. Fetching
live costs a few extra Neo4j reads per turn, which is acceptable. Domain objects in graph state
are ruled out too.

**How to apply:** keep domain objects out of graph state, and don't hand nodes a cached entity
list. Entity agents keep their own entity, since they all run before anything is committed.
