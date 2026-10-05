import { StateGraph, START, END } from '@langchain/langgraph'
import { router } from './agents/router.js'
import { roomAgent } from './agents/room-agent.js'
import { fixtureAgent } from './agents/fixture-agent.js'
import { playerAgent } from './agents/player-agent.js'
import { doorAgent } from './agents/door-agent.js'
import { arbiter } from './agents/arbiter.js'
import { committer } from './agents/committer.js'
import { narrator } from './agents/narrator.js'
import { recorder } from './agents/recorder.js'
import type { Entity } from '@domain/entities/entity.js'
import { RoomEntity } from '@domain/entities/room-entity.js'
import { FixtureEntity } from '@domain/entities/fixture-entity.js'
import { PlayerEntity } from '@domain/entities/player-entity.js'
import { DoorEntity } from '@domain/entities/door-entity.js'
import type { Game } from '@domain/game/game.js'
import { GameTurnAnnotation } from './game-turn-state.js'

export class MultiAgentGraph {
  #graph: any
  #game: Game

  constructor(game: Game) {
    this.#graph = new StateGraph(GameTurnAnnotation) as any
    this.#game = game
  }

  /** The graph is rebuilt every turn—its nodes are the entities standing near the player. */
  async build() {
    const nearbyEntities = await this.#game.nearbyEntities()

    this.#addRouter()
    this.#addArbiter()
    this.#addCommitter()
    this.#addNarrator()
    this.#addRecorder()
    this.#addAgents(nearbyEntities)

    return this.#graph.compile()
  }

  #addRouter() {
    this.#graph.addNode('router', router(this.#game))
    this.#graph.addEdge(START, 'router')
  }

  #addArbiter() {
    this.#graph.addNode('arbiter', arbiter(this.#game))
    this.#graph.addEdge('arbiter', 'committer')
  }

  #addCommitter() {
    this.#graph.addNode('committer', committer(this.#game))
    this.#graph.addEdge('committer', 'narrator')
  }

  #addNarrator() {
    this.#graph.addNode('narrator', narrator(this.#game))
    this.#graph.addEdge('narrator', 'recorder')
  }

  #addRecorder() {
    this.#graph.addNode('recorder', recorder(this.#game))
    this.#graph.addEdge('recorder', END)
  }

  #addAgents(nearbyEntities: Entity[]) {
    const routingDestinations: Record<string, any> = {}

    for (const entity of nearbyEntities) {
      const nodeName = entity.entityId
      this.#addAgent(entity)
      this.#graph.addEdge(nodeName, 'arbiter')
      routingDestinations[nodeName] = nodeName
    }

    routingDestinations['default'] = 'arbiter'

    this.#graph.addConditionalEdges(
      'router',
      (state: typeof GameTurnAnnotation.State) => this.#routeToEntityAgents(state),
      routingDestinations
    )
  }

  #routeToEntityAgents(state: typeof GameTurnAnnotation.State): string[] {
    const selectedAgents = state.selectedEntities.map(entity => entity.entityId)

    return selectedAgents.length > 0 ? selectedAgents : ['default']
  }

  #addAgent(entity: Entity) {
    const nodeName = entity.entityId

    switch (entity.constructor) {
      case RoomEntity:
        this.#graph.addNode(nodeName, roomAgent(entity as RoomEntity))
        break
      case FixtureEntity:
        this.#graph.addNode(nodeName, fixtureAgent(entity as FixtureEntity))
        break
      case PlayerEntity:
        this.#graph.addNode(nodeName, playerAgent(entity as PlayerEntity))
        break
      case DoorEntity:
        this.#graph.addNode(nodeName, doorAgent(entity as DoorEntity))
        break
      default:
        throw new Error(`Unknown entity type: ${entity.constructor.name}`)
    }
  }
}
