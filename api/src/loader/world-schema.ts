import { z } from 'zod'

/**
 * The shape of a world file. A world is authored content—it lives in `worlds/` as
 * JSON and is copied into the graph when a game starts, so nothing in the database is
 * ever a world, only live game state.
 */

const statuses = z.array(z.string()).default([])

const fixtureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  statuses,
  actions: z.array(z.string()).default([])
})

// A door connects two rooms and works both ways, unless it's one-way from the first room to the second.
const doorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  statuses,
  connects: z.tuple([z.string().min(1), z.string().min(1)]),
  oneWay: z.boolean().default(false)
})

const roomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  statuses,
  fixtures: z.array(fixtureSchema).default([])
})

const playerSchema = z.object({
  name: z.string().min(1).default('Player'),
  description: z.string().default(''),
  statuses
})

export const worldSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    startingRoom: z.string().min(1),
    player: playerSchema.optional(),
    rooms: z.array(roomSchema).min(1),
    doors: z.array(doorSchema).default([])
  })
  .superRefine((world, context) => {
    // The set of all id
    const seenIds = new Set<string>()

    // Helper to check for duplicates and report them to the context.
    const duplicate = (id: string, path: PropertyKey[]) => {
      if (seenIds.has(id)) context.addIssue({ code: 'custom', message: `Duplicate id in world: ${id}`, path })
      seenIds.add(id)
    }

    // Check every room, every fixture in every room, and every door for duplicate ids.
    world.rooms.forEach((room, roomIndex) => {
      duplicate(room.id, ['rooms', roomIndex, 'id'])
      room.fixtures.forEach((fixture, i) => duplicate(fixture.id, ['rooms', roomIndex, 'fixtures', i, 'id']))
    })
    world.doors.forEach((door, i) => duplicate(door.id, ['doors', i, 'id']))

    // All the room ids
    const roomIds = new Set(world.rooms.map(room => room.id))

    // Check that the starting room is a valid room id
    if (!roomIds.has(world.startingRoom)) {
      context.addIssue({
        code: 'custom',
        message: `startingRoom is not a room in this world: ${world.startingRoom}`,
        path: ['startingRoom']
      })
    }

    // Check that every door connects two different, valid room ids
    world.doors.forEach((door, i) => {
      door.connects.forEach((roomId, end) => {
        if (roomIds.has(roomId)) return
        context.addIssue({
          code: 'custom',
          message: `Door "${door.id}" connects to a room that does not exist: ${roomId}`,
          path: ['doors', i, 'connects', end]
        })
      })

      if (door.connects[0] !== door.connects[1]) return
      context.addIssue({
        code: 'custom',
        message: `Door "${door.id}" connects a room to itself: ${door.connects[0]}`,
        path: ['doors', i, 'connects']
      })
    })
  })

export type WorldData = z.infer<typeof worldSchema>
