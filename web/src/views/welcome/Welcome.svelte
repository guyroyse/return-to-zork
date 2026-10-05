<script lang="ts">
  import { appRouter } from '../../app/app-router.svelte'
</script>

<section class="menu">
  <button class="primary" onclick={() => appRouter.routeToNewGame()}><i class="fa-solid fa-wand-magic-sparkles"></i>New Game</button>
  <button onclick={() => appRouter.routeToLoadGame()}><i class="fa-solid fa-folder-open"></i>Load Game</button>
</section>
