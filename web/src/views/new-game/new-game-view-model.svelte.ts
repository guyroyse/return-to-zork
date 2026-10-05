import { api, type World } from '../../services/api'

const adjectives = ['Epic', 'Mysterious', 'Ancient', 'Forbidden', 'Lost', 'Dark', 'Golden', 'Secret']
const nouns = ['Quest', 'Adventure', 'Journey', 'Expedition', 'Mission', 'Tale', 'Saga', 'Chronicle']

function pick(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)]!
}

export default class NewGameViewModel {
  worlds = $state<World[]>([])
  worldId = $state('')
  gameName = $state(`${pick(adjectives)} ${pick(nouns)}`)
  isStarting = $state(false)

  get canStart() {
    return !this.isStarting && this.worldId !== '' && this.gameName.trim() !== ''
  }

  async loadWorlds() {
    this.worlds = await api.worlds()
    this.worldId = this.worlds[0]?.id ?? ''
  }

  async startGame(): Promise<string> {
    this.isStarting = true
    const game = await api.startGame(this.worldId, this.gameName.trim())
    return game.gameId
  }
}
