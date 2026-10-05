<script lang="ts">
  import { onMount } from 'svelte'
  import { api, type Game } from '../../services/api'
  import { appRouter } from '../../app/app-router.svelte'

  let games = $state<Game[] | null>(null)
  let selectedId = $state('')

  const selected = $derived(games?.find(game => game.gameId === selectedId))

  onMount(async () => {
    games = await api.games()
    selectedId = games[0]?.gameId ?? ''
  })

  function handleStart(event: Event) {
    event.preventDefault()
    appRouter.routeToGame(selectedId)
  }

  async function handleDelete() {
    if (!selected || !confirm(`Delete "${selected.name}"? This can't be undone.`)) return
    await api.deleteGame(selected.gameId)
    games = games!.filter(game => game.gameId !== selected.gameId)
    selectedId = games[0]?.gameId ?? ''
  }

  function formatLastPlayed(isoString: string): string {
    return new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  }
</script>

<form class="screen" onsubmit={handleStart}>
  <h2>Load Game</h2>

  {#if games === null}
    <p class="muted">Loading saved games...</p>
  {:else if games.length === 0}
    <p class="muted">No saved games found.</p>
  {:else}
    <div class="games">
      {#each games as game (game.gameId)}
        <label class="choice">
          <input type="radio" name="game" value={game.gameId} bind:group={selectedId} />
          <strong>{game.name}</strong>
          <span>{game.world.name} · Last played {formatLastPlayed(game.lastPlayed)}</span>
        </label>
      {/each}
    </div>
  {/if}

  <div class="actions">
    <button type="button" onclick={() => appRouter.routeToWelcome()}
      ><i class="fa-solid fa-arrow-left"></i>Back to Home</button
    >
    <button type="button" class="danger" disabled={!selected} onclick={handleDelete}
      ><i class="fa-solid fa-trash"></i>Delete Game</button
    >
    <button class="primary" disabled={!selected}><i class="fa-solid fa-play"></i>Start Game</button>
  </div>
</form>
