import { randomUUID } from 'node:crypto'

import { DoorEntity, type DoorData } from '@src/domain/entities/door-entity.js'
import type { EntityData } from '@src/domain/entities/entity.js'
import { FixtureEntity, type FixtureData } from '@src/domain/entities/fixture-entity.js'
import { Game } from '@src/domain/game/game.js'
import { PlayerEntity, type PlayerData } from '@src/domain/entities/player-entity.js'
import { RoomEntity, type RoomData } from '@src/domain/entities/room-entity.js'

import type { WorldData } from './world-schema.js'

/** The fields every authored entity shares in a world file. */
type EntityJson = {
  id: string
  name: string
  description: string
  statuses: string[]
}

/**
 * Builds a new game from a world file.
 *
 * @param worldId The id of the world the game is started from.
 * @param worldJson The world to load into a new game.
 * @param name The name the player gave this game.
 * @returns A new game entity with all the rooms, fixtures, doors, and player created and linked together.
 */
export async function loadWorld(worldId: string, worldJson: WorldData, name: string): Promise<Game> {
  const game = await Game.create({ name, worldId, worldName: worldJson.name, opening: opening(worldJson) })

  const rooms = new Map<string, RoomEntity>()
  for (const roomJson of worldJson.rooms) {
    const data: RoomData = entityData(roomJson)
    const room = await RoomEntity.create(data)
    rooms.set(roomJson.id, room)
  }

  for (const roomJson of worldJson.rooms) {
    const room = findRoom(rooms, roomJson.id)

    for (const fixtureJson of roomJson.fixtures) {
      const data: FixtureData = { ...entityData(fixtureJson), actions: fixtureJson.actions }
      const fixture = await FixtureEntity.create(data)
      await room.addFixture(fixture)
    }
  }

  // A two-way door is in both rooms and leads to both; a one-way door is only in the first
  for (const doorJson of worldJson.doors) {
    const data: DoorData = entityData(doorJson)
    const door = await DoorEntity.create(data)
    const from = findRoom(rooms, doorJson.connects[0])
    const to = findRoom(rooms, doorJson.connects[1])

    await from.addDoor(door)
    await door.addDestination(to)

    if (doorJson.oneWay) continue

    await to.addDoor(door)
    await door.addDestination(from)
  }

  const startingRoom = findRoom(rooms, worldJson.startingRoom)
  await game.startingRoom(startingRoom)

  const playerJson = worldJson.player ?? { name: 'Player', description: '', statuses: [] }
  const data: PlayerData = { ...entityData({ id: 'player', ...playerJson }) }
  const player = await PlayerEntity.create(data)
  await game.player(player)
  await player.room(startingRoom)

  return game
}

/** The starting room's name and description, the way Zork opens a game. */
function opening(worldJson: WorldData): string {
  const room = worldJson.rooms.find(room => room.id === worldJson.startingRoom)!
  return `${room.name}\n\n${room.description}`
}

function entityData(json: EntityJson): EntityData {
  return {
    instanceId: randomUUID(),
    entityId: json.id,
    name: json.name,
    description: json.description,
    statuses: json.statuses
  }
}

function findRoom(rooms: Map<string, RoomEntity>, id: string): RoomEntity {
  const room = rooms.get(id)
  if (!room) throw new Error(`The world refers to a room that was not created: ${id}`)
  return room
}
