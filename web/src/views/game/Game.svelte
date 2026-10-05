<script lang="ts">
  import { onMount } from 'svelte'
  import { appRouter } from '../../app/app-router.svelte'
  import GameViewModel from './game-view-model.svelte'
  import GameHistory from './GameHistory.svelte'
  import GameInput from './GameInput.svelte'

  let { gameId }: { gameId: string } = $props()

  // svelte-ignore state_referenced_locally
  const viewModel = new GameViewModel(gameId)

  onMount(() => viewModel.loadGame())
</script>

<div class="screen">
  <section class="panel terminal">
    <header>
      <h2>{viewModel.game?.name ?? 'Loading...'}</h2>
    </header>

    <GameHistory {viewModel} />
    <GameInput {viewModel} />
  </section>

  <div class="actions">
    <button onclick={() => appRouter.routeToWelcome()}><i class="fa-solid fa-door-open"></i>Quit</button>
  </div>
</div>
