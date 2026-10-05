import { run, runOne } from '@accessors/neo4j/query.js'

import { Entity, type EntityData } from './entity.js'
import { RoomEntity, type RoomData } from './room-entity.js'

/** `roomId` is the entityId of the room the player is in, so agents can see where a move starts. */
export type PlayerData = EntityData & { roomId?: string }

export class PlayerEntity extends Entity {
  readonly entityType = 'player' as const
  readonly roomId?: string

  constructor(data: PlayerData) {
    super(data)
    this.roomId = data.roomId
  }

  static async create(data: PlayerData): Promise<PlayerEntity> {
    const instanceId = await runOne<string>`
      CREATE (player:Player)
      SET player = ${this.properties(data)}
      RETURN player.instanceId
    `

    if (!instanceId) throw new Error('The player node was not created')

    return new PlayerEntity(data)
  }

  room(): Promise<RoomEntity | null>
  room(room: RoomEntity): Promise<void>
  room(maybeRoom?: RoomEntity): Promise<RoomEntity | null | void> {
    return maybeRoom ? this.#setRoom(maybeRoom) : this.#getRoom()
  }

  async #getRoom(): Promise<RoomEntity | null> {
    const data = await runOne<RoomData>`
      MATCH (player:Player) WHERE player.instanceId = ${this.instanceId}
      MATCH (player)-[:IN]->(room:Room)
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

  async #setRoom(room: RoomEntity): Promise<void> {
    await run`
      MATCH (player:Player) WHERE player.instanceId = ${this.instanceId}
      MATCH (room:Room) WHERE room.instanceId = ${room.instanceId}
      OPTIONAL MATCH (player)-[isIn:IN]->()
      DELETE isIn
      CREATE (player)-[:IN]->(room)
    `
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      roomId: this.roomId
    }
  }
}
