import { api, type Game, type GameTurn } from '../../services/api'

export default class GameViewModel {
  game = $state<Game | null>(null)
  history = $state<GameTurn[]>([])
  currentCommand = $state('')
  isLoadingHistory = $state(false)
  isProcessingCommand = $state(false)
  #gameId: string

  constructor(gameId: string) {
    this.#gameId = gameId
  }

  get isLoading() {
    return this.isLoadingHistory || this.isProcessingCommand
  }

  async loadGame() {
    this.isLoadingHistory = true
    const [{ game }, history] = await Promise.all([api.game(this.#gameId), api.turns(this.#gameId)])
    this.game = game
    this.history = history
    this.isLoadingHistory = false
  }

  async submitCommand() {
    const command = this.currentCommand.trim()
    if (this.isLoading || command === '') return

    this.currentCommand = ''
    this.isProcessingCommand = true
    try {
      this.history.push(await api.takeTurn(this.#gameId, command))
    } catch (error) {
      this.history.push({ gameId: this.#gameId, command, reply: `Error: ${(error as Error).message}` })
    }
    this.isProcessingCommand = false
  }
}
