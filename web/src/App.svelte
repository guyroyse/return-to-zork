<script lang="ts">
  import { appRouter } from './app/app-router.svelte'
  import Welcome from './views/welcome/Welcome.svelte'
  import NewGame from './views/new-game/NewGame.svelte'
  import LoadGame from './views/load-game/LoadGame.svelte'
  import Game from './views/game/Game.svelte'
</script>

<header class="title">
  <h1>Return to Zork</h1>
  <p>A Multi-Agent Text Adventure Game</p>
</header>

<main>
  {#if appRouter.route.name === 'welcome'}
    <Welcome />
  {:else if appRouter.route.name === 'new-game'}
    <NewGame />
  {:else if appRouter.route.name === 'load-game'}
    <LoadGame />
  {:else if appRouter.route.name === 'game'}
    {#key appRouter.route.gameId}
      <Game gameId={appRouter.route.gameId} />
    {/key}
  {/if}
</main>
