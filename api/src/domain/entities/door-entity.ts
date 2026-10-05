import { run, runOne } from '@accessors/neo4j/query.js'

import { Entity, type EntityData } from './entity.js'
import type { RoomEntity } from './room-entity.js'

/** `leadsTo` is the entityId of the room on the other side, from the room the door was fetched from. */
export type DoorData = EntityData & { leadsTo?: string }

export class DoorEntity extends Entity {
  readonly entityType = 'door' as const
  readonly leadsTo?: string

  constructor(data: DoorData) {
    super(data)
    this.leadsTo = data.leadsTo
  }

  static async create(data: DoorData): Promise<DoorEntity> {
    const instanceId = await runOne<string>`
      CREATE (door:Door)
      SET door = ${this.properties(data)}
      RETURN door.instanceId
    `

    if (!instanceId) throw new Error('The door node was not created')

    return new DoorEntity(data)
  }

  /** Lets this door take the player into a room. A two-way door leads to both of its rooms. */
  async addDestination(room: RoomEntity): Promise<void> {
    await run`
      MATCH (door:Door) WHERE door.instanceId = ${this.instanceId}
      MATCH (room:Room) WHERE room.instanceId = ${room.instanceId}
      MERGE (door)-[:LEADS_TO]->(room)
    `
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      leadsTo: this.leadsTo
    }
  }
}
