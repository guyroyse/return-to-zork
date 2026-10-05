// Hash routes, so a refresh or the back button keeps the player where they were.
export type Route =
  | { name: 'welcome' }
  | { name: 'new-game' }
  | { name: 'load-game' }
  | { name: 'game'; gameId: string }

function parse(hash: string): Route {
  const [section, gameId] = hash.replace(/^#\/?/, '').split('/')

  if (section === 'new') return { name: 'new-game' }
  if (section === 'games' && gameId) return { name: 'game', gameId }
  if (section === 'games') return { name: 'load-game' }
  return { name: 'welcome' }
}

class AppRouter {
  #route = $state<Route>(parse(location.hash))

  constructor() {
    window.addEventListener('hashchange', () => (this.#route = parse(location.hash)))
  }

  get route() {
    return this.#route
  }

  routeToWelcome() {
    location.hash = '#/'
  }

  routeToNewGame() {
    location.hash = '#/new'
  }

  routeToLoadGame() {
    location.hash = '#/games'
  }

  routeToGame(gameId: string) {
    location.hash = `#/games/${gameId}`
  }
}

export const appRouter = new AppRouter()
