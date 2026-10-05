<script lang="ts">
  import { onMount } from 'svelte'
  import { appRouter } from '../../app/app-router.svelte'
  import NewGameViewModel from './new-game-view-model.svelte'

  const viewModel = new NewGameViewModel()

  onMount(() => viewModel.loadWorlds())

  async function handleStart(event: Event) {
    event.preventDefault()
    const gameId = await viewModel.startGame()
    appRouter.routeToGame(gameId)
  }
</script>

<form class="screen" onsubmit={handleStart}>
  <h2>New Game</h2>

  <!-- svelte-ignore a11y_autofocus -->
  <input class="game-name" bind:value={viewModel.gameName} disabled={viewModel.isStarting} autofocus />

  <div class="worlds">
    {#each viewModel.worlds as world (world.id)}
      <label class="choice">
        <input type="radio" name="world" value={world.id} bind:group={viewModel.worldId} />
        <strong>{world.name}</strong>
        <span>{world.description}</span>
      </label>
    {/each}
  </div>

  <div class="actions">
    <button type="button" disabled={viewModel.isStarting} onclick={() => appRouter.routeToWelcome()}
      ><i class="fa-solid fa-arrow-left"></i>Back to Home</button
    >
    <button class="primary" disabled={!viewModel.canStart}>
      <i class="fa-solid fa-play"></i>{viewModel.isStarting ? 'Starting...' : 'Start Game'}
    </button>
  </div>
</form>
