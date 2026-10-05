import { fetchAllWorlds, fetchWorld } from '@accessors/worlds/world-files.js'
import { loadWorld } from '@loader/load-world.js'
import type { WorldData } from '@loader/world-schema.js'

import type { Game } from './game.js'

/** A world a new game can be started from—authored content, never live game state. */
export class World {
  readonly id: string
  #data: WorldData

  private constructor(id: string, data: WorldData) {
    this.id = id
    this.#data = data
  }

  get name(): string {
    return this.#data.name
  }

  get description(): string {
    return this.#data.description
  }

  static fetch(id: string): World | null {
    const data = fetchWorld(id)
    return data ? new World(id, data) : null
  }

  static fetchAll(): World[] {
    return fetchAllWorlds().map(({ id, data }) => new World(id, data))
  }

  /** Copies this world into the graph as a new game with the name the player chose. */
  start(name: string): Promise<Game> {
    return loadWorld(this.id, this.#data, name)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description
    }
  }
}
