// Every request is same-origin and relative: Vite's dev server proxies /api to the
// Express server, in Docker and on the host alike.
// Nothing here needs `credentials: 'include'` or a configured base URL.
const BASE = '/api'

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers }
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new ApiError(response.status, detail?.error ?? response.statusText)
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

export type World = { id: string; name: string; description: string }

export type Game = {
  gameId: string
  name: string
  world: { id: string; name: string }
  opening: string
  createdAt: string
  lastPlayed: string
}

export type GameTurn = { gameId: string; command: string; reply: string }

export const api = {
  worlds: () => request<World[]>('/worlds'),
  games: () => request<Game[]>('/games'),
  game: (gameId: string) => request<{ game: Game }>(`/games/${gameId}`),
  startGame: (world: string, name: string) =>
    request<Game>('/games', { method: 'POST', body: JSON.stringify({ world, name }) }),
  deleteGame: (gameId: string) => request<void>(`/games/${gameId}`, { method: 'DELETE' }),
  turns: (gameId: string) => request<GameTurn[]>(`/games/${gameId}/turns`),
  takeTurn: (gameId: string, command: string) =>
    request<GameTurn>(`/games/${gameId}/turns`, { method: 'POST', body: JSON.stringify({ command }) })
}

export { ApiError }
