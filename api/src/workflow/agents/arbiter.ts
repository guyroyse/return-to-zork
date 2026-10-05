import dedent from 'dedent'
import { fetchLLMClient } from '@accessors/openai/llm-client.js'
import {
  GameTurnAnnotation,
  EntityChangesSchema,
  type EntityChangeRecommendation,
  type EntityChanges
} from '../game-turn-state.js'
import type { Entity } from '@domain/entities/entity.js'
import type { Game } from '@domain/game/game.js'

type ArbiterReturnType = Partial<typeof GameTurnAnnotation.State>

export function arbiter(game: Game) {
  return async function (state: typeof GameTurnAnnotation.State): Promise<ArbiterReturnType> {
    const userCommand = state.userCommand
    const entityChangeRecommendations = state.entityChangeRecommendations as EntityChangeRecommendation[]

    // Basic validation
    if (!userCommand) throw new Error('Missing user command')

    // The arbiter sees everything nearby, not just what was selected—it owns movement, which needs the doors
    const nearbyEntities = await game.nearbyEntities()

    // Set up LLM with prompt and structured output
    const llm = await fetchLLMClient()
    const structuredLLM = llm.withStructuredOutput(EntityChangesSchema)
    const prompt = buildArbiterPrompt(userCommand, nearbyEntities, entityChangeRecommendations)

    // Invoke LLM and parse structured output
    const entityChanges = (await structuredLLM.invoke(prompt)) as EntityChanges

    // Return the determined changes
    return { entityChanges: entityChanges.entityChanges }
  }
}

function buildArbiterPrompt(
  userCommand: string,
  nearbyEntities: Entity[],
  entityChangeRecommendations: EntityChangeRecommendation[]
) {
  return dedent`
    You are the ARBITER in a multi-agent text adventure game system.

    TASK: Review entity change recommendations and determine the final changes to apply.

    Your role: Process structured recommendations from entity agents and decide what changes should happen based on the player's command.

    DECISION PROCESS:
    • Consider the original player command to understand intent
    • Review each agent's structured recommendations (addStatuses, removeStatuses, setProperties)
    • Resolve conflicts when multiple agents recommend contradictory changes
    • Ensure changes are logically consistent and feasible
    • Consider cross-entity effects that individual agents might miss

    CONFLICT RESOLUTION:
    • When agents disagree, choose the outcome that best matches player intent
    • Prioritize safety and game balance
    • Preserve narrative consistency
    • Use the original command to break ties

    CROSS-ENTITY CONSIDERATIONS:
    • Some actions affect multiple entities beyond what individual agents can see
    • Examples: lighting affects both object and location, breaking things affects area

    MOVEMENT (you decide this; no other agent moves the player):
    • The player is in the room named by the player's roomId. Each door's leadsTo is the room on its other side.
    • If the command moves the player ("go", "enter", "climb", "walk", a direction, through or into something),
      find the door it means among the doors here, by name, description, or a direction the room description gives.
    • A direction must match: "go up" needs a door the room or door description says leads up. If no door here
      matches the direction or thing named, there is no move, even if the room has only one door.
    • If that door allows passage once this command's other changes are applied (not locked, closed, hidden,
      blocked, or similar), add a change for entityId "player" with setProperties
      [{ "property": "roomId", "value": <that door's leadsTo> }].
    • If no door fits, or the door doesn't allow passage, don't move the player.
    • Only doors move the player. Fixtures are never exits.

    If there are no recommendations and the command doesn't move the player, return an empty entityChanges array.

    PLAYER COMMAND: ${userCommand}

    GAME ENTITIES (current state: the player, their room, and everything in it):
    ${JSON.stringify(nearbyEntities)}

    ENTITY CHANGE RECOMMENDATIONS:
    ${JSON.stringify(entityChangeRecommendations)}
  `
}
