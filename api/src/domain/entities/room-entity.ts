import { run, runMany, runOne } from '@accessors/neo4j/query.js'

import { Entity, type EntityData } from './entity.js'
import { FixtureEntity, type FixtureData } from './fixture-entity.js'
import { DoorEntity, type DoorData } from './door-entity.js'

export type RoomData = EntityData

export class RoomEntity extends Entity {
  readonly entityType = 'room' as const

  /** Finds a room in a game by the entityId the world file gave it. */
  static async fetch(gameId: string, entityId: string): Promise<RoomEntity | null> {
    const data = await runOne<RoomData>`
      MATCH (game:Game) WHERE game.gameId = ${gameId}
      MATCH (game)-[*]->(room:Room) WHERE room.entityId = ${entityId}
      RETURN DISTINCT room {
        .instanceId,
        .entityId,
        .name,
        .description,
        .statuses
      } AS room
      LIMIT 1
    `

    return data ? new RoomEntity(data) : null
  }

  static async create(data: RoomData): Promise<RoomEntity> {
    const instanceId = await runOne<string>`
      CREATE (room:Room)
      SET room = ${this.properties(data)}
      RETURN room.instanceId
    `
    if (!instanceId) throw new Error('The room node was not created')

    return new RoomEntity(data)
  }

  async fixtures(): Promise<FixtureEntity[]> {
    const rows = await runMany<FixtureData>`
      MATCH (room:Room) WHERE room.instanceId = ${this.instanceId}
      MATCH (room)-[:CONTAINS]->(fixture:Fixture)
      RETURN fixture {
        .instanceId,
        .entityId,
        .name,
        .description,
        .statuses,
        .actions
      } AS fixture
    `

    return rows.map(row => new FixtureEntity(row))
  }

  async addFixture(fixture: FixtureEntity): Promise<void> {
    await run`
      MATCH (room:Room) WHERE room.instanceId = ${this.instanceId}
      MATCH (fixture:Fixture) WHERE fixture.instanceId = ${fixture.instanceId}
      MERGE (room)-[:CONTAINS]->(fixture)
    `
  }

  async doors(): Promise<DoorEntity[]> {
    const rows = await runMany<DoorData>`
      MATCH (room:Room) WHERE room.instanceId = ${this.instanceId}
      MATCH (room)-[:CONTAINS]->(door:Door)-[:LEADS_TO]->(destination:Room) WHERE destination <> room
      RETURN door {
        .instanceId,
        .entityId,
        .name,
        .description,
        .statuses,
        leadsTo: destination.entityId
      } AS door
    `

    return rows.map(data => new DoorEntity(data))
  }

  async addDoor(door: DoorEntity): Promise<void> {
    await run`
      MATCH (room:Room) WHERE room.instanceId = ${this.instanceId}
      MATCH (door:Door) WHERE door.instanceId = ${door.instanceId}
      MERGE (room)-[:CONTAINS]->(door)
    `
  }
}
