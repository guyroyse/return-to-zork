import dedent from 'dedent'

import type { GameTurn } from '@domain/game/game-turn.js'

/**
 * Renders recent turns as verbatim transcript for an LLM prompt. This is what lets
 * a command like "open it" resolve—the referent is in the previous turn, not in the
 * current game state.
 */
export function formatRecentTurns(turns: GameTurn[], opening: string): string {
  if (turns.length === 0) return `This is the first turn of the game. The player has just read the opening:\n\n${opening}`

  return turns
    .map(
      turn => dedent`
    > ${turn.command}
    ${turn.reply}
  `
    )
    .join('\n\n')
}
