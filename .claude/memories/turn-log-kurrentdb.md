---
name: Turn log lives in KurrentDB
description: Why the per-game turn log is a KurrentDB stream while the game graph is Neo4j
metadata:
  type: project
---

The turn log is KurrentDB: one stream per game.

**Why:** the turn log is an append-only log per game, not a table, and it should be a real
service in Compose rather than a file in the API container. Neo4j, Kafka, Postgres, NATS JetStream, Mongo, and JSONL files were all
considered. A LangGraph checkpointer was rejected: every channel replaces its value per turn,
it would serialize game state, and it checkpoints every superstep.

**How to apply:** the game graph stays in Neo4j; turns stay in KurrentDB. Deleting a game must
clear both stores. A turnless game has no stream, so reads and deletes must tolerate a missing one.
