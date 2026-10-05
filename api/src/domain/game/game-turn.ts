import {
  BACKWARDS,
  END,
  jsonEvent,
  StreamNotFoundError,
  WrongExpectedVersionError,
  type JSONEventType
} from '@kurrent/kurrentdb-client'

import { client } from '@accessors/kurrentdb/client.js'

type TurnTaken = JSONEventType<
  'TurnTaken',
  {
    command: string
    reply: string
  }
>

export class GameTurn {
  #gameId: string
  #command: string
  #reply: string

  private constructor(gameId: string, command: string, reply: string) {
    this.#gameId = gameId
    this.#command = command
    this.#reply = reply
  }

  get gameId(): string {
    return this.#gameId
  }

  get command(): string {
    return this.#command
  }

  get reply(): string {
    return this.#reply
  }

  toJSON() {
    return {
      gameId: this.#gameId,
      command: this.#command,
      reply: this.#reply
    }
  }

  /**
   * Fetch all turns for a specific game, oldest first.
   */
  static async fetchAll(gameId: string): Promise<GameTurn[]> {
    return await GameTurn.#read(gameId, {})
  }

  /**
   * Fetch the most recent turns for a game, oldest first, for use as LLM context.
   */
  static async fetchRecent(gameId: string, count: number): Promise<GameTurn[]> {
    const turns = await GameTurn.#read(gameId, { direction: BACKWARDS, fromRevision: END, maxCount: count })
    return turns.reverse()
  }

  /**
   * Append a new turn to the end of the game's log.
   */
  static async append(gameId: string, command: string, reply: string): Promise<GameTurn> {
    await client.appendToStream(streamName(gameId), jsonEvent<TurnTaken>({ type: 'TurnTaken', data: { command, reply } }))

    return new GameTurn(gameId, command, reply)
  }

  /**
   * Delete all turns for a specific game.
   */
  static async deleteAll(gameId: string): Promise<void> {
    // a game with no turns has no stream to delete
    try {
      await client.deleteStream(streamName(gameId))
    } catch (error) {
      if (!(error instanceof WrongExpectedVersionError)) throw error
    }
  }

  static async #read(gameId: string, options: Parameters<typeof client.readStream>[1]): Promise<GameTurn[]> {
    const turns: GameTurn[] = []

    // a game's stream doesn't exist until its first turn is appended
    try {
      for await (const { event } of client.readStream<TurnTaken>(streamName(gameId), options)) {
        turns.push(new GameTurn(gameId, event!.data.command, event!.data.reply))
      }
    } catch (error) {
      if (!(error instanceof StreamNotFoundError)) throw error
    }

    return turns
  }
}

function streamName(gameId: string): string {
  return `game-${gameId}`
}
