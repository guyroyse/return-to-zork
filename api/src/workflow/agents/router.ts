import dedent from 'dedent'

import { fetchLLMClient } from '@accessors/openai/llm-client.js'
import { GameTurnAnnotation, SelectedEntitiesSchema, type SelectedEntities } from '../game-turn-state.js'
import type { Entity } from '@domain/entities/entity.js'
import type { Game } from '@domain/game/game.js'
import type { GameTurn } from '@domain/game/game-turn.js'
import { formatRecentTurns } from '../format-turns.js'

type RouterReturnType = Partial<typeof GameTurnAnnotation.State>

export function router(game: Game) {
  return async function (state: typeof GameTurnAnnotation.State): Promise<RouterReturnType> {
    const userCommand = state.userCommand

    // Basic validation
    if (!userCommand) throw new Error('Missing user command')

    // Set up LLM with prompt and structured output
    const nearbyEntities = await game.nearbyEntities()
    const llm = await fetchLLMClient()
    const structuredLLM = llm.withStructuredOutput(SelectedEntitiesSchema)
    const prompt = buildRouterPrompt(nearbyEntities, userCommand, state.recentTurns, game.opening)

    // Invoke LLM and parse structured output
    const selection = (await structuredLLM.invoke(prompt)) as SelectedEntities

    // Return the structured output directly
    return { selectedEntities: selection.selectedEntities }
  }
}

function buildRouterPrompt(nearbyEntities: Entity[], userCommand: string, recentTurns: GameTurn[], opening: string): string {
  return dedent`
    You are a ROUTER in a multi-agent text adventure game system.

    Your role: Identify which entities need to analyze potential state or property changes for this command.

    WHAT CONSTITUTES A CHANGE:
    Any modification to entity data - statuses, properties, attributes, or relationships.

    SELECTION CRITERIA:
    Select entities ONLY if the player action could modify their:
    - Status flags (locked → unlocked, lit → unlit, broken, hidden, etc.)
    - Properties (location, ownership, destination, condition, etc.)
    - Attributes (health, inventory, relationships, abilities, etc.)

    COMMON CHANGE PATTERNS:
    • Movement: "go north" → DOOR entity (changes player.roomId property)
    • Interaction: "unlock door" → DOOR entity (removes "locked" status)
    • Object use: "light torch" → FIXTURE entity (adds "lit" status)
    • Inventory: "take sword" → PLAYER + ITEM entities (ownership transfer)
    • Social: "attack goblin" → NPC + PLAYER entities (health, relationship changes)

    OBSERVATIONAL COMMANDS (select NO entities):
    • "look around", "examine", "describe", "where am I"
    • Pure information gathering without interaction

    CROSS-ENTITY EFFECTS:
    When actions affect multiple entities, select all that change:
    • "give sword to merchant" → ITEM (owner), PLAYER (inventory), NPC (inventory)
    • "break magical seal" → FIXTURE (status), ROOM (protection), PLAYER (consequences)

    For each selected entity, explain what specific change might occur.

    RECENT TURNS:
    Use these to resolve pronouns and references in the command—"it", "that", "the
    door" all refer to something the player saw or did in these turns.

    ${formatRecentTurns(recentTurns, opening)}

    AVAILABLE ENTITIES:
    ${JSON.stringify(nearbyEntities)}

    PLAYER COMMAND:
    ${userCommand}
  `
}
