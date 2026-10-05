import { GameTurnAnnotation } from '../game-turn-state.js'
import type { Game } from '@domain/game/game.js'

type RecorderReturnType = Partial<typeof GameTurnAnnotation.State>

/**
 * Hands the turn off to the next one by appending it to the game's log. The turns
 * written here are what later turns read back as context.
 */
export function recorder(game: Game) {
  return async function (state: typeof GameTurnAnnotation.State): Promise<RecorderReturnType> {
    const userCommand = state.userCommand
    const finalNarrative = state.finalNarrative

    if (!userCommand) throw new Error('Missing user command')
    if (!finalNarrative) throw new Error('Missing narrative')

    await game.recordTurn(userCommand, finalNarrative)

    return {}
  }
}
