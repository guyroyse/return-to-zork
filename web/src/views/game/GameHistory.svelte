<script lang="ts">
  import type GameViewModel from './game-view-model.svelte'

  let { viewModel }: { viewModel: GameViewModel } = $props()

  let historyElement: HTMLDivElement

  $effect(() => {
    // Read these so the effect reruns, and scrolls to the bottom, whenever a turn lands
    viewModel.history.length
    viewModel.isLoading

    historyElement.scrollTop = historyElement.scrollHeight
  })
</script>

<div class="history" bind:this={historyElement}>
  {#if viewModel.game}
    <p class="reply">{viewModel.game.opening}</p>
  {/if}

  {#each viewModel.history as turn}
    <p class="command">&gt; {turn.command}</p>
    <p class="reply">{turn.reply}</p>
  {/each}
</div>
