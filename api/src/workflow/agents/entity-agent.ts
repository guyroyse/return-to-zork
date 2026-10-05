import { fetchLLMClient } from '@accessors/openai/llm-client.js'
import {
  GameTurnAnnotation,
  EntityChangeRecommendationSchema,
  type EntityChangeRecommendation,
  type SelectedEntity
} from '../game-turn-state.js'
import type { Entity } from '@domain/entities/entity.js'

type AgentReturnType = Partial<typeof GameTurnAnnotation.State>

export function createAgent<T extends Entity>(
  entity: T,
  promptBuilder: (entity: T, userCommand: string, reasoning: string) => string | Promise<string>
) {
  return async function (state: typeof GameTurnAnnotation.State): Promise<AgentReturnType> {
    const userCommand = state.userCommand
    const selections = state.selectedEntities as SelectedEntity[]

    // Basic validation
    if (!userCommand) throw new Error('Missing user command')

    // Find router reasoning for selecting me
    const selection = selections.find((selection: SelectedEntity) => selection.entityId === entity.entityId)
    const reasoning = selection?.reasoning ?? 'No reasoning provided'

    // Set up LLM with prompt and structured output
    const llm = await fetchLLMClient()
    const structuredLLM = llm.withStructuredOutput(EntityChangeRecommendationSchema)
    const prompt = await promptBuilder(entity, userCommand, reasoning)

    // Invoke LLM and parse structured output
    const entityChangeRecommendations = (await structuredLLM.invoke(prompt)) as EntityChangeRecommendation

    // Return change recommendations directly
    return {
      entityChangeRecommendations
    }
  }
}
