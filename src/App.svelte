<script lang="ts">
  import Router from "./Router.svelte";
  import Actions from "./routes/Actions.svelte";
  import { gameState } from "./state";
</script>

<main>
  <div class="grid h-full grid-cols-12 grid-rows-[auto_1fr_auto]">
    <div
      class="col-span-12 grid grid-cols-12 text-center border-b-slate-400 border-b"
    >
      <div
        class="col-span-12 border-b-slate-400 border-b"
        class:text-slate-500={!$gameState.data.action}
      >
        {$gameState.data.action ?? "no action running"}
      </div>
      <div
        class="col-span-12 border-b-slate-400 border-b"
        class:text-slate-500={!$gameState.data.action}
      >
        {$gameState.data.action ?? "no action running"}
      </div>
      <div class="col-span-12 grid grid-cols-12">skills</div>
    </div>

    <div class="col-span-12 grid grid-cols-12 border-b-slate-400 border-b">
      <div class="col-span-9">
        <Router
          routingSettings={{
            actions: Actions,
          }}
          currentRoute={$gameState.data.mainViewRoute}
        />
      </div>
      <div class="col-span-3 border-l border-l-slate-400">
        {#each $gameState.data.logEntries as { ts, text }}
          <div class="border-b-slate-400 border-b px-3 py-1 text-sm">
            <div class="text-right text-slate-500">+00:0{ts}</div>
            <div>{text}</div>
          </div>
        {/each}
      </div>
    </div>
    <div class="col-span-12 grid grid-cols-12">btm</div>
  </div>
</main>

<style>
  main {
    height: 100%;
  }
</style>
