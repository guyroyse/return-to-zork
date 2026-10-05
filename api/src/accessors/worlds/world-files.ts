import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

import { WORLD_DIR } from '@src/env.js'

import { worldSchema, type WorldData } from '@loader/world-schema.js'

/** Every world in `worlds/`, keyed by its filename without `.json`. Filled once at startup. */
const worlds = new Map<string, WorldData>()

/**
 * Reads and validates every world file in the worlds directory. A bad file stops
 * startup rather than failing when a player picks it.
 *
 * @returns a promise resolving when every world has been loaded
 */
export async function loadWorlds(): Promise<void> {
  const files = await readdir(WORLD_DIR)

  for (const file of files.filter(file => file.endsWith('.json'))) {
    const json = JSON.parse(await readFile(join(WORLD_DIR, file), 'utf8'))
    worlds.set(basename(file, '.json'), worldSchema.parse(json))
  }
}

/** Every world, with the id it's known by. */
export function fetchAllWorlds(): { id: string; data: WorldData }[] {
  return Array.from(worlds, ([id, data]) => ({ id, data }))
}

/** The data for a world, or null if there's no such world. */
export function fetchWorld(id: string): WorldData | null {
  return worlds.get(id) ?? null
}
