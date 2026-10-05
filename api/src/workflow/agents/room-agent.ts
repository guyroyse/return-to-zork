import dedent from 'dedent'
import { createAgent } from './entity-agent.js'
import type { RoomEntity } from '@domain/entities/room-entity.js'

export function roomAgent(room: RoomEntity) {
  return createAgent(room, buildRoomPrompt)
}

function buildRoomPrompt(entity: RoomEntity, userCommand: string, reasoning: string) {
  return dedent`
    You are a ROOM AGENT representing "${entity.name}".

    TASK: Analyze what changes should happen to this room based on the player's command.

    Your role: Determine if the player's action would modify this room's status or properties.

    ROOM DATA:
    ${JSON.stringify(entity)}

    SELECTION REASONING: ${reasoning}

    CHANGE ANALYSIS:
    Consider what STATUS CHANGES this room should undergo:
    • Environmental effects: lighting changes, damage, atmospheric shifts
    • Physical alterations: debris, structural changes, magical effects
    • Accessibility changes: blockages cleared, passages opened

    Consider what PROPERTY CHANGES this room might need:
    • Structural modifications that alter room characteristics
    • Environmental state transitions

    EXAMPLES:
    • "light torch" → addStatuses: ["lit"], removeStatuses: ["dark"]
    • "break wall" → addStatuses: ["damaged", "debris"]
    • "cast silence spell" → addStatuses: ["silenced"]

    DO NOT RECOMMEND CHANGES FOR:
    • Pure observation commands ("look around", "examine room")
    • Questions that don't modify the environment

    If no changes are needed, return empty arrays with reasoning explaining why.

    PLAYER COMMAND: ${userCommand}
  `
}
