import { run } from '@accessors/neo4j/query.js'

export type EntityType = 'player' | 'room' | 'fixture' | 'door'

export type EntityData = {
  instanceId: string
  entityId: string
  name: string
  description: string
  statuses: string[]
}

export abstract class Entity {
  abstract readonly entityType: EntityType
  readonly instanceId: string
  readonly entityId: string
  readonly name: string
  readonly description: string
  #statuses: Set<string>

  constructor(data: EntityData) {
    this.instanceId = data.instanceId
    this.entityId = data.entityId
    this.name = data.name
    this.description = data.description
    this.#statuses = new Set(data.statuses)
  }

  get statuses(): string[] {
    return Array.from(this.#statuses)
  }

  set statuses(statuses: string[]) {
    this.#statuses = new Set(statuses)
  }

  addStatus(...statuses: string[]): void {
    statuses.forEach(status => this.#statuses.add(status))
  }

  removeStatus(...statuses: string[]): void {
    statuses.forEach(status => this.#statuses.delete(status))
  }

  hasStatus(status: string): boolean {
    return this.#statuses.has(status)
  }

  async save(): Promise<void> {
    await run`
      MATCH (entity) WHERE entity.instanceId = ${this.instanceId}
      SET entity.statuses = ${this.statuses}
    `
  }

  async delete(): Promise<void> {
    await run`
      MATCH (entity) WHERE entity.instanceId = ${this.instanceId}
      DETACH DELETE entity
    `
  }

  /** What agents see. The instanceId stays out—it's a database key, not something an LLM should refer to. */
  toJSON() {
    return {
      entityType: this.entityType,
      entityId: this.entityId,
      name: this.name,
      description: this.description,
      statuses: this.statuses
    }
  }

  protected static properties(data: EntityData): Record<string, unknown> {
    return {
      instanceId: data.instanceId,
      entityId: data.entityId,
      name: data.name,
      description: data.description,
      statuses: data.statuses
    }
  }
}
