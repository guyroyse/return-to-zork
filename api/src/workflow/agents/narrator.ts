import dedent from 'dedent'

import { fetchLLMClient } from '@accessors/openai/llm-client.js'
import { GameTurnAnnotation, FinalNarrativeSchema, type EntityChange, type FinalNarrative } from '../game-turn-state.js'
import type { Entity } from '@domain/entities/entity.js'
import type { Game } from '@domain/game/game.js'
import type { GameTurn } from '@domain/game/game-turn.js'
import { formatRecentTurns } from '../format-turns.js'

type NarratorReturnType = Partial<typeof GameTurnAnnotation.State>

export function narrator(game: Game) {
  return async function (state: typeof GameTurnAnnotation.State): Promise<NarratorReturnType> {
    const userCommand = state.userCommand
    const entityChanges = state.entityChanges

    // Basic validation
    if (!userCommand) throw new Error('Missing user command')

    // Set up LLM with prompt and structured output
    // Fetched after the committer, so a move shows the room the player is in now
    const nearbyEntities = await game.nearbyEntities()
    const llm = await fetchLLMClient()
    const structuredLLM = llm.withStructuredOutput(FinalNarrativeSchema)
    const prompt = buildNarratorPrompt(nearbyEntities, userCommand, entityChanges, state.recentTurns, game.opening)

    // Invoke LLM and parse structured output
    const narrative = (await structuredLLM.invoke(prompt)) as FinalNarrative

    // Return the final narrative
    return { finalNarrative: narrative.finalNarrative }
  }
}

function buildNarratorPrompt(
  nearbyEntities: Entity[],
  userCommand: string,
  entityChanges: EntityChange[],
  recentTurns: GameTurn[],
  opening: string
): string {
  return dedent`
    You are the NARRATOR in a multi-agent text adventure game system.

    TASK: Tell the player what happened as a result of their command, using only the facts below.

    WHAT YOU MAY DESCRIBE:
    • Only what is in GAME ENTITIES and APPLIED CHANGES. Don't invent objects, people, sounds, smells,
      weather, directions, or reasons that aren't in an entity's name, description, or statuses.
    • APPLIED CHANGES are the only things that happened. If the command asked for something that isn't
      there, it didn't happen: say plainly that it didn't ("You can't go that way.", "Nothing happens.")
      without making up a reason.
    • The player is in the room whose entityId matches the player's roomId. Don't describe any other room.

    EXITS:
    • End with the room's name and its exits. Exits are only the entities with entityType "door", never fixtures.
    • Name each exit by its door name. Mention a direction only if the room's or door's description gives one.
      Example: "Kitchen. Exits: Kitchen Passage, Dark Staircase, Kitchen Window."

    STYLE:
    • Second person, plain and direct, in the tone of the room descriptions.
    • One or two sentences for most commands, before the room and exits line.
    • After the player moves, or for a bare "look" at the surroundings, give the room's description; don't add to it.
    • When the player looks at or examines one thing, give only that entity's description, not the room's.
    • Don't repeat descriptions the player read in the last turn unless they asked to look.

    RECENT TURNS:
    What just happened, so your narration follows on naturally.

    ${formatRecentTurns(recentTurns, opening)}

    GAME ENTITIES:
    ${JSON.stringify(nearbyEntities)}

    APPLIED CHANGES:
    ${JSON.stringify(entityChanges)}

    PLAYER COMMAND: ${userCommand}

  `
}
