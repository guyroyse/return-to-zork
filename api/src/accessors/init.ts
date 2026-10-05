import { setTimeout as sleep } from 'node:timers/promises'

import { driver } from './neo4j/driver.js'
import { run } from './neo4j/query.js'

const MAX_ATTEMPTS = 30
const DELAY_MS = 1000

/**
 * Creates anything the graph is missing. KurrentDB has nothing to create—a game's
 * stream appears when its first turn is appended.
 *
 * @returns a promise resolving when the database is ready to use
 */
export async function initDatabase(): Promise<void> {
  await initNeo4j()
}

/**
 * Waits for Neo4j to accept connections, then creates any constraints it's missing.
 *
 * @returns a promise resolving when Neo4j is ready and all constraints have been created
 */
async function initNeo4j(): Promise<void> {
  await waitForNeo4j(MAX_ATTEMPTS, DELAY_MS)

  // a game is looked up by its gameId
  await run`CREATE CONSTRAINT game_id IF NOT EXISTS FOR (g:Game) REQUIRE g.gameId IS UNIQUE`

  // rooms, fixtures, doors, and players are looked up by their instanceId
  await run`CREATE CONSTRAINT room_instance_id IF NOT EXISTS FOR (r:Room) REQUIRE r.instanceId IS UNIQUE`
  await run`CREATE CONSTRAINT fixture_instance_id IF NOT EXISTS FOR (f:Fixture) REQUIRE f.instanceId IS UNIQUE`
  await run`CREATE CONSTRAINT door_instance_id IF NOT EXISTS FOR (d:Door) REQUIRE d.instanceId IS UNIQUE`
  await run`CREATE CONSTRAINT player_instance_id IF NOT EXISTS FOR (p:Player) REQUIRE p.instanceId IS UNIQUE`
}

/**
 * Waits for Neo4j to be ready to accept connections.
 *
 * @param attempts the number of attempts to make before giving up
 * @param delayMs the number of milliseconds to wait between attempts
 * @returns a promise resolving when Neo4j is ready
 */
async function waitForNeo4j(attempts: number, delayMs: number): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await driver.getServerInfo()
      return
    } catch (error) {
      if (attempt >= attempts) throw error
      await sleep(delayMs)
    }
  }
}
