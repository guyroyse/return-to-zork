import dedent from 'dedent'
import { createAgent } from './entity-agent.js'
import type { DoorEntity } from '@domain/entities/door-entity.js'

export function doorAgent(door: DoorEntity) {
  return createAgent(door, buildDoorPrompt)
}

async function buildDoorPrompt(door: DoorEntity, userCommand: string, reasoning: string) {
  return dedent`
    You are a DOOR AGENT representing a passage or connection between rooms.

    TASK: Analyze what changes should happen to this door based on the player's command.

    Your role: Determine if the player's action would modify the door's status or trigger movement through it.

    DOOR DATA:
    ${JSON.stringify(door)}

    LEADS TO:
    ${door.leadsTo ?? 'nowhere — this door leads nowhere'}

    SELECTION REASONING: ${reasoning}

    CHANGE ANALYSIS:
    Consider what STATUS CHANGES the door should undergo:
    • Access control: locked, unlocked, blocked, clear
    • Physical condition: open, closed, broken, repaired
    • Visibility: hidden, revealed, obvious
    • Safety: safe, dangerous, trapped

    Consider what PROPERTY CHANGES might be needed:
    • Destination changes (if the door leads somewhere new)
    • Condition modifications that affect traversal

    MOVEMENT HANDLING:
    If the player is attempting to move through this door:
    • Check if the door allows passage (not locked, blocked, etc.)
    • Say in your reasoning whether passage is allowed and why
    • Don't recommend the move itself—the arbiter moves the player

    EXAMPLES:
    • "unlock door" → removeStatuses: [{"status": "locked", "reasoning": "player unlocked the door"}]
    • "go north" (if this door leads north) → no door changes; reasoning says whether passage is clear
    • "break door" → addStatuses: [{"status": "broken", "reasoning": "door was broken by player"}], removeStatuses: [{"status": "locked", "reasoning": "broken door can't stay locked"}]
    • "examine door" → no changes (pure observation)

    MOVEMENT LOGIC:
    Passage is allowed only if:
    1. The command indicates movement intent ("go", "enter", "walk", "move", etc.)
    2. This door is the target of that movement
    3. The door is not blocked by statuses like "locked" or "blocked"
    4. The door has a destination room (LEADS TO is not "nowhere")

    If movement is blocked, explain why in your reasoning.

    If no changes are needed, return empty arrays with reasoning explaining why.

    PLAYER COMMAND: ${userCommand}
  `
}
