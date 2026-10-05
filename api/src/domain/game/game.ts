import { randomUUID } from 'node:crypto'

import { run, runMany, runOne } from '@accessors/neo4j/query.js'

import { GameTurn } from './game-turn.js'
import type { Entity } from '../entities/entity.js'
import { PlayerEntity, type PlayerData } from '../entities/player-entity.js'
import { RoomEntity, type RoomData } from '../entities/room-entity.js'

export type GameData = {
  gameId: string
  name: string
  worldId: string
  worldName: string
  opening: string
  createdAt: string
  lastPlayed: string
}

export class Game {
  readonly gameId: string
  readonly name: string
  readonly worldId: string
  readonly worldName: string
  /** The stock text a new game opens with, shown before the first command. */
  readonly opening: string
  readonly createdAt: string
  #lastPlayed: string

  constructor(data: GameData) {
    this.gameId = data.gameId
    this.name = data.name
    this.worldId = data.worldId
    this.worldName = data.worldName
    this.opening = data.opening
    this.createdAt = data.createdAt
    this.#lastPlayed = data.lastPlayed
  }

  get lastPlayed(): string {
    return this.#lastPlayed
  }

  static async create(data: Pick<GameData, 'name' | 'worldId' | 'worldName' | 'opening'>): Promise<Game> {
    const row = await runOne<GameData>`
      CREATE (game:Game {
        gameId: ${randomUUID()},
        name: ${data.name},
        worldId: ${data.worldId},
        worldName: ${data.worldName},
        opening: ${data.opening},
        createdAt: datetime(), 
        lastPlayed: datetime() 
      })
      RETURN game {
        .gameId,
        .name,
        .worldId,
        .worldName,
        .opening,
        createdAt: toString(game.createdAt),
        lastPlayed: toString(game.lastPlayed)
      } AS game
    `

    if (!row) throw new Error('The game node was not created')

    return new Game(row)
  }

  static async fetch(gameId: string): Promise<Game | null> {
    const data = await runOne<GameData>`
      MATCH (game:Game) WHERE game.gameId = ${gameId}
      RETURN game {
        .gameId,
        .name,
        .worldId,
        .worldName,
        .opening,
        createdAt: toString(game.createdAt),
        lastPlayed: toString(game.lastPlayed)
      } AS game
    `

    return data ? new Game(data) : null
  }

  static async fetchAll(): Promise<Game[]> {
    const rows = await runMany<GameData>`
      MATCH (game:Game)
      WITH game ORDER BY game.lastPlayed DESC
      RETURN game {
        .gameId,
        .name,
        .worldId,
        .worldName,
        .opening,
        createdAt: toString(game.createdAt),
        lastPlayed: toString(game.lastPlayed)
      } AS game
    `

    return rows.map(row => new Game(row))
  }

  async touch(): Promise<void> {
    const lastPlayed = await runOne<string>`
      MATCH (game:Game) WHERE game.gameId = ${this.gameId}
      SET game.lastPlayed = datetime()
      RETURN toString(game.lastPlayed)
    `

    if (!lastPlayed) throw new Error('The game node was not found')

    this.#lastPlayed = lastPlayed
  }

  async delete(): Promise<void> {
    await GameTurn.deleteAll(this.gameId)
    await run`
      MATCH (game:Game) WHERE game.gameId = ${this.gameId}
      MATCH (game)-[*0..]->(entity)
      DETACH DELETE entity
    `
  }

  turns(): Promise<GameTurn[]> {
    return GameTurn.fetchAll(this.gameId)
  }

  recentTurns(count: number): Promise<GameTurn[]> {
    return GameTurn.fetchRecent(this.gameId, count)
  }

  recordTurn(command: string, reply: string): Promise<GameTurn> {
    return GameTurn.append(this.gameId, command, reply)
  }

  /**
   * The player, the room they're standing in, and everything in that room—the entities
   * a turn can see and change.
   */
  async nearbyEntities(): Promise<Entity[]> {
    const player = await this.player()
    if (!player) throw new Error(`No player found for game ${this.gameId}`)

    const room = await player.room()
    if (!room) throw new Error(`No location found for player ${player.entityId} in game ${this.gameId}`)

    const fixtures = await room.fixtures()
    const doors = await room.doors()

    return [player, room, ...fixtures, ...doors]
  }

  player(): Promise<PlayerEntity | null>
  player(player: PlayerEntity): Promise<void>
  player(maybePlayer?: PlayerEntity): Promise<PlayerEntity | null | void> {
    return maybePlayer ? this.#setPlayer(maybePlayer) : this.#getPlayer()
  }

  async #getPlayer(): Promise<PlayerEntity | null> {
    const data = await runOne<PlayerData>`
      MATCH (game:Game) WHERE game.gameId = ${this.gameId}
      MATCH (game)-[:HAS_PLAYER]->(player:Player)
      OPTIONAL MATCH (player)-[:IN]->(room:Room)
      RETURN player {
        .instanceId,
        .entityId,
        .name,
        .description,
        .statuses,
        roomId: room.entityId
      } AS player
    `

    return data ? new PlayerEntity(data) : null
  }

  async #setPlayer(player: PlayerEntity): Promise<void> {
    await run`
      MATCH (game:Game) WHERE game.gameId = ${this.gameId}
      MATCH (player:Player) WHERE player.instanceId = ${player.instanceId}
      OPTIONAL MATCH (game)-[:HAS_PLAYER]->(previous:Player) WHERE previous <> player
      DETACH DELETE previous
      MERGE (game)-[:HAS_PLAYER]->(player)
    `
  }

  startingRoom(): Promise<RoomEntity | null>
  startingRoom(room: RoomEntity): Promise<void>
  startingRoom(maybeRoom?: RoomEntity): Promise<RoomEntity | null | void> {
    return maybeRoom ? this.#setStartingRoom(maybeRoom) : this.#getStartingRoom()
  }

  async #getStartingRoom(): Promise<RoomEntity | null> {
    const data = await runOne<RoomData>`
      MATCH (game:Game) WHERE game.gameId = ${this.gameId}
      MATCH (game)-[:STARTS_AT]->(room:Room)
      RETURN room {
        .instanceId,
        .entityId,
        .name,
        .description,
        .statuses
      } AS room
    `

    return data ? new RoomEntity(data) : null
  }

  async #setStartingRoom(room: RoomEntity): Promise<void> {
    await run`
      MATCH (game:Game) WHERE game.gameId = ${this.gameId}
      MATCH (room:Room) WHERE room.instanceId = ${room.instanceId}
      OPTIONAL MATCH (game)-[startsAt:STARTS_AT]->()
      DELETE startsAt
      CREATE (game)-[:STARTS_AT]->(room)
    `
  }

  toJSON() {
    return {
      gameId: this.gameId,
      name: this.name,
      world: { id: this.worldId, name: this.worldName },
      opening: this.opening,
      createdAt: this.createdAt,
      lastPlayed: this.#lastPlayed
    }
  }
}
