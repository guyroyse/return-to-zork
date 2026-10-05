import express from 'express'

import { PORT } from './env.js'
import { driver } from './accessors/neo4j/driver.js'
import { initDatabase } from './accessors/init.js'
import { loadWorlds } from './accessors/worlds/world-files.js'
import { gamesRouter } from './routes/games.js'

const app = express()

app.use(express.json())

app.use('/api', gamesRouter)

await initDatabase()
await loadWorlds()

const server = app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`)
})

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`)
  server.close(async () => {
    await driver.close()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
