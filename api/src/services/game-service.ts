import { Game } from '@domain/game/game.js'
import type { GameTurn } from '@domain/game/game-turn.js'
import { World } from '@domain/game/world.js'
import { MultiAgentGraph } from '@workflow/graph-builder.js'
import { RECENT_TURN_COUNT } from '@src/env.js'

/** Everything the API can do with a game. Returns null when the game or world doesn't exist. */
export class GameService {
  /** The worlds a new game can be started from. */
  static worlds(): World[] {
    return World.fetchAll()
  }

  /** Every saved game, most recently played first. */
  static list(): Promise<Game[]> {
    return Game.fetchAll()
  }

  /** Starts a new game from a world. */
  static async start(worldId: string, name: string): Promise<Game | null> {
    const world = World.fetch(worldId)
    if (!world) return null

    return world.start(name)
  }

  /** The game, the player, and where the player is standing. */
  static async fetch(gameId: string) {
    const game = await Game.fetch(gameId)
    if (!game) return null

    const player = await game.player()
    const room = await player?.room()
    const fixtures = await room?.fixtures()
    const doors = await room?.doors()

    return { game, player, room, fixtures, doors }
  }

  static async delete(gameId: string): Promise<boolean> {
    const game = await Game.fetch(gameId)
    if (!game) return false

    await game.delete()
    return true
  }

  /** Plays a turn—the workflow decides what the command does and narrates the result. */
  static async takeTurn(gameId: string, command: string): Promise<string | null> {
    const game = await Game.fetch(gameId)
    if (!game) return null

    const recentTurns = await game.recentTurns(RECENT_TURN_COUNT)

    // The recorder node appends this turn to the log on its way out of the graph
    const graph = await new MultiAgentGraph(game).build()
    const result = await graph.invoke({ userCommand: command, recentTurns })

    await game.touch()

    return result.finalNarrative
  }

  /** The transcript so far, oldest first. */
  static async turns(gameId: string): Promise<GameTurn[] | null> {
    const game = await Game.fetch(gameId)
    if (!game) return null

    return game.turns()
  }
}
