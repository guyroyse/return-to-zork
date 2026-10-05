import {
  GameTurnAnnotation,
  type EntityChange,
  type EntityPropertyChange,
  type EntityStatusAddition,
  type EntityStatusRemoval
} from '../game-turn-state.js'
import { RoomEntity } from '@domain/entities/room-entity.js'
import type { Entity } from '@domain/entities/entity.js'
import type { PlayerEntity } from '@domain/entities/player-entity.js'
import type { Game } from '@domain/game/game.js'

type CommitterReturnType = Partial<typeof GameTurnAnnotation.State>

export function committer(game: Game) {
  return async function (state: typeof GameTurnAnnotation.State): Promise<CommitterReturnType> {
    const entityChanges = state.entityChanges as EntityChange[]

    // Apply entity changes to the game
    const nearbyEntities = await game.nearbyEntities()
    await applyEntityChanges(game, nearbyEntities, entityChanges)

    // Committer does not produce new state, just applies changes
    return {}
  }
}

async function applyEntityChanges(game: Game, nearbyEntities: Entity[], changes: EntityChange[]): Promise<void> {
  for (const change of changes) {
    await applyEntityChange(game, nearbyEntities, change)
  }
}

async function applyEntityChange(game: Game, nearbyEntities: Entity[], change: EntityChange): Promise<void> {
  const entity = nearbyEntities.find((entity: Entity) => entity.entityId === change.entityId)

  if (!entity) return

  // Apply changes
  applyStatusAdditions(entity, change.addStatuses)
  applyStatusRemovals(entity, change.removeStatuses)
  await applyPropertyChanges(game, entity, change.setProperties)

  // Save the entity with all changes applied
  await entity.save()
}

function applyStatusAdditions(entity: Entity, additions: EntityStatusAddition[]): void {
  for (const statusToAdd of additions) entity.addStatus(statusToAdd.status)
}

function applyStatusRemovals(entity: Entity, removals: EntityStatusRemoval[]): void {
  for (const statusToRemove of removals) entity.removeStatus(statusToRemove.status)
}

async function applyPropertyChanges(
  game: Game,
  entity: Entity,
  changes: EntityPropertyChange[]
): Promise<void> {
  for (const change of changes) await applyPropertyChange(game, entity, change)
}

async function applyPropertyChange(game: Game, entity: Entity, change: EntityPropertyChange): Promise<void> {
  if (change.property === 'roomId' && entity.entityType === 'player') {
    await updatePlayerRoom(game, entity as PlayerEntity, change)
  }
}

async function updatePlayerRoom(
  game: Game,
  player: PlayerEntity,
  change: EntityPropertyChange
): Promise<void> {
  // Make sure the room exists in this game
  const room = await RoomEntity.fetch(game.gameId, change.value)
  if (!room) return

  // Moving the player is a relationship write, not a property Entity.save() persists
  await player.room(room)
}
