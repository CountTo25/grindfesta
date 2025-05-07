<script lang="ts">
  import Router from "./Router.svelte";
  import Actions from "./routes/Actions.svelte";
  import { gameState } from "./state";
  import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
  import { formatTime } from "./utils";
</script>

<main class="h-screen">
  <div class="grid h-full grid-cols-12 grid-rows-[auto_1fr_auto]">
    <!-- Top header -->
    <div
      class="col-span-12 grid grid-cols-12 text-center border-b-2 border-b-slate-400"
    >
      <div class="col-span-12 border-b-2 border-b-slate-400">
        {formatTime($gameState.data.run.timeSpent)}
      </div>
      <div
        class="col-span-12 border-b-2 border-b-slate-400"
        class:text-slate-500={!$gameState.data.run.action}
      >
        {$gameState.data.run.action ?? "no action running"}
      </div>
      <div class="col-span-12 grid grid-cols-12">skills</div>
    </div>

    <!-- Main content -->
    <div
      class="col-span-12 grid grid-cols-12 border-b-2 border-b-slate-400 overflow-hidden flex-col"
    >
      <!-- Left main view -->
      <div class="col-span-9 overflow-hidden">
        <Router
          routingSettings={{
            actions: Actions,
          }}
          currentRoute={$gameState.data.run.mainViewRoute}
        />
      </div>

      <!-- Log view -->
      <div
        class="col-span-3 border-l border-l-slate-400 h-full overflow-hidden flex flex-col"
      >
        <div class="overflow-y-auto flex-1">
          {#each $gameState.data.run.logEntries as { ts, text }}
            <div class="border-b-2 border-b-slate-400 px-3 py-1 text-sm">
              <div class="text-right text-slate-500">{formatTime(ts)}</div>
              <div>{text}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="col-span-12 grid grid-cols-12">btm</div>
  </div>
</main>

<style>
  main {
    height: 100%;
  }
</style>
