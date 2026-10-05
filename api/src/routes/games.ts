import { Router } from 'express'
import { z } from 'zod'

import { GameService } from '@services/game-service.js'

export const gamesRouter = Router()

const gameIdParam = z.object({ gameId: z.uuid() })
const newGameBody = z.object({ world: z.string().min(1), name: z.string().trim().min(1) })
const turnBody = z.object({ command: z.string().min(1) })

/** The worlds a new game can be started from. */
gamesRouter.get('/worlds', (req, res) => {
  res.json(GameService.worlds())
})

/** Saved games, most recently played first. */
gamesRouter.get('/games', async (req, res) => {
  res.json(await GameService.list())
})

/** Starts a game from a world—POST the id of one from `/worlds` and a name for the game. */
gamesRouter.post('/games', async (req, res) => {
  const { world, name } = newGameBody.parse(req.body)

  const game = await GameService.start(world, name)
  if (!game) return res.status(404).json({ error: 'not found' })

  res.status(201).json(game)
})

/** The game, the player, and where the player is standing. */
gamesRouter.get('/games/:gameId', async (req, res) => {
  const { gameId } = gameIdParam.parse(req.params)

  const state = await GameService.fetch(gameId)
  if (!state) return res.status(404).json({ error: 'not found' })

  res.json(state)
})

gamesRouter.delete('/games/:gameId', async (req, res) => {
  const { gameId } = gameIdParam.parse(req.params)

  const deleted = await GameService.delete(gameId)
  if (!deleted) return res.status(404).json({ error: 'not found' })

  res.status(204).end()
})

/** Plays a turn—POST a command and the workflow decides what happens. */
gamesRouter.post('/games/:gameId/turns', async (req, res) => {
  const { gameId } = gameIdParam.parse(req.params)
  const { command } = turnBody.parse(req.body)

  const reply = await GameService.takeTurn(gameId, command)
  if (reply === null) return res.status(404).json({ error: 'not found' })

  res.status(201).json({ gameId, command, reply })
})

/** The transcript so far, oldest first. */
gamesRouter.get('/games/:gameId/turns', async (req, res) => {
  const { gameId } = gameIdParam.parse(req.params)

  const turns = await GameService.turns(gameId)
  if (!turns) return res.status(404).json({ error: 'not found' })

  res.json(turns)
})
