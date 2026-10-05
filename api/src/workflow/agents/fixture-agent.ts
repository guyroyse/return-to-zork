import dedent from 'dedent'
import { createAgent } from './entity-agent.js'
import type { FixtureEntity } from '@domain/entities/fixture-entity.js'

export function fixtureAgent(fixture: FixtureEntity) {
  return createAgent(fixture, buildFixturePrompt)
}

function buildFixturePrompt(entity: FixtureEntity, userCommand: string, reasoning: string) {
  return dedent`
    You are a FIXTURE AGENT representing "${entity.name}".

    TASK: Analyze what changes should happen to this fixture based on the player's command.

    Your role: Determine if the player's action would modify this fixture's status or properties.

    FIXTURE DATA:
    ${JSON.stringify(entity)}

    SELECTION REASONING: ${reasoning}

    CHANGE ANALYSIS:
    Consider what STATUS CHANGES this fixture should undergo:
    • Activation states: active, inactive, triggered, dormant
    • Physical states: broken, damaged, repaired, lit, extinguished
    • Access states: locked, unlocked, opened, closed, hidden, revealed

    Consider what PROPERTY CHANGES this fixture might need:
    • Condition or state value modifications
    • Ownership or control changes

    EXAMPLES:
    • "activate lever" → addStatuses: ["activated"], removeStatuses: ["dormant"]
    • "break statue" → addStatuses: ["broken", "damaged"]
    • "light torch" → addStatuses: ["lit"], removeStatuses: ["extinguished"]
    • "unlock chest" → removeStatuses: ["locked"]

    DO NOT RECOMMEND CHANGES FOR:
    • Pure observation commands ("examine", "look at")
    • Questions that don't physically interact with the fixture

    If no changes are needed, return empty arrays with reasoning explaining why.

    PLAYER COMMAND: ${userCommand}
  `
}
