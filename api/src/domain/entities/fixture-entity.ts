import { runOne } from '@accessors/neo4j/query.js'

import { Entity, type EntityData } from './entity.js'

export type FixtureData = EntityData & {
  actions: string[]
}

export class FixtureEntity extends Entity {
  readonly entityType = 'fixture' as const

  readonly actions: string[]

  constructor(data: FixtureData) {
    super(data)
    this.actions = data.actions
  }

  static async create(data: FixtureData): Promise<FixtureEntity> {
    const instanceId = await runOne<string>`
      CREATE (fixture:Fixture)
      SET fixture = ${this.properties(data)}
      RETURN fixture.instanceId
    `

    if (!instanceId) throw new Error('The fixture node was not created')

    return new FixtureEntity(data)
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      actions: this.actions
    }
  }

  protected static override properties(data: FixtureData): Record<string, unknown> {
    return {
      ...super.properties(data),
      actions: data.actions
    }
  }
}
