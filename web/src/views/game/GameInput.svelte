<script lang="ts">
  import type GameViewModel from './game-view-model.svelte'

  let { viewModel }: { viewModel: GameViewModel } = $props()

  let inputElement: HTMLInputElement
  let thinkingMessage = $state('Thinking...')

  const thinkingMessages = [
    'Thinking...',
    'Pondering...',
    'Analyzing...',
    'Considering...',
    'Processing...',
    'Evaluating...',
    'Contemplating...'
  ]

  function handleSubmit(event: Event) {
    event.preventDefault()
    viewModel.submitCommand()
  }

  $effect(() => {
    if (!viewModel.isLoading) inputElement.focus()
  })

  $effect(() => {
    if (viewModel.isProcessingCommand) {
      thinkingMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]!
    }
  })
</script>

<form class="prompt" onsubmit={handleSubmit}>
  <label for="command-input">&gt;</label>
  <input
    id="command-input"
    bind:this={inputElement}
    bind:value={viewModel.currentCommand}
    disabled={viewModel.isLoading}
    placeholder={viewModel.isProcessingCommand ? thinkingMessage : 'Enter command...'}
    autocomplete="off"
  />
</form>
