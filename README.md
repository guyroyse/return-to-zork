# Return to Zork

A text adventure where AI agents run the world. Every room, fixture, door, and the player is an agent, and a [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) workflow decides what each command does. It's built as a demo of multi-agent workflows.

## How a turn works

Each time you type a command, the API builds a graph from the entities standing near the player and runs it:

1. **Router.** Reads your command and picks which nearby entities it involves.
2. **Entity agents.** Each chosen room, fixture, door, or player agent proposes how it would change in response.
3. **Arbiter.** Weighs the proposals and decides what actually happens. Only the arbiter can move the player.
4. **Committer.** Writes the arbiter's changes to the game graph.
5. **Narrator.** Tells you what happened, using only what's in the game and what changed.
6. **Recorder.** Appends the command and reply to the game's turn log.

Because the graph is rebuilt every turn, its nodes change as you move from room to room.

## What it's made of

| Part | Built with | Does |
| --- | --- | --- |
| `web/` | Svelte 5, Vite | The game UI |
| `api/` | Express, LangGraph.js, OpenAI | The REST API and the agent workflow |
| Neo4j | | Each game's live state: rooms, fixtures, doors, and the player |
| KurrentDB | | Each game's turn log, one stream per game |
| `worlds/` | JSON files | The worlds a new game can be started from |

## Running it

You need Docker and an OpenAI API key. Put the key in a `.env` file at the root of the repo:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-6-luna   # optional; this is the default
```

Then start everything:

```sh
docker compose up --build
```

Open **http://localhost:5173** and start a new game.

The web app and the API both reload when you edit their source files. After you add or remove a dependency, rebuild that container with `docker compose up --build web` (or `api`).

While it's running you can also look inside the databases:

- **Neo4j Browser:** http://localhost:7474, user `neo4j`, password `password`
- **KurrentDB UI:** http://localhost:2113

Docker Compose is for development only. There's no production build.

## Writing a world

A world is a JSON file in `worlds/`. Each one has a name and description, a starting room, rooms with fixtures in them, and doors that connect the rooms:

```json
{
  "name": "West of House",
  "description": "Shown when picking a world.",
  "startingRoom": "west-of-house",
  "player": { "name": "Adventurer", "description": "..." },
  "rooms": [
    {
      "id": "west-of-house",
      "name": "West of House",
      "description": "You are standing in an open field west of a white house...",
      "fixtures": [
        {
          "id": "mailbox",
          "name": "Small Mailbox",
          "description": "...",
          "statuses": ["closed"],
          "actions": ["open", "close", "look inside"]
        }
      ]
    }
  ],
  "doors": [
    {
      "id": "kitchen-window",
      "name": "Kitchen Window",
      "description": "...",
      "statuses": ["closed"],
      "connects": ["behind-house", "kitchen"],
      "oneWay": false
    }
  ]
}
```

Doors work in both directions unless `oneWay` is true, in which case they lead only from the first room to the second. Ids must be unique across the whole world. The API reads the world files at startup, so restart the `api` container after adding or changing one.
