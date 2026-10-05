---
name: API endpoints the UI needs
description: The agreed /api surface; the player names each game; the game log and version endpoints are deliberately left out
metadata:
  type: project
---

The `/api` surface the web UI needs is settled (agreed 2026-10-03). Each game is started from a world
the player picks and is named by the player (or a random name from the UI).

**Why:** the world is picked per game, so there's no admin screen for loading one. The opening text is stored on the game node, not
as a turn: a turn is a command plus a reply, and a commandless turn would need special-casing
in the router and narrator, which read recent turns.

**How to apply:** don't add a game log endpoint (a debug view of agent output and Mermaid
graphs is out of scope) or a version endpoint, and don't propose them again unless asked.
