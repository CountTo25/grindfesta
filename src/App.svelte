<script lang="ts">
  import Router from "./Router.svelte";
  import Actions from "./routes/Actions.svelte";
  import {
    gameState,
    endRun,
    knowledgeSignal,
    subLocationSignal,
  } from "./state";
  import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
  import {
    COMPLETION_EFFECTS,
    CONDITION_CHECKS,
    formatTime,
    LOCATION_CHECKS,
  } from "./utils";
  //LOAD
  CONDITION_CHECKS;
  COMPLETION_EFFECTS;
  //
  import ProgressBar from "./parts/ProgressBar.svelte";
  import GenericIcon from "./parts/GenericIcon.svelte";
  import type { GameState, Location, Skill } from "./types";
  import SkillBar from "./parts/SkillBar.svelte";
  import Button from "./components/Button.svelte";
  import { fade } from "svelte/transition";
  import { get } from "svelte/store";
  import EndRun from "./parts/EndRun.svelte";
  const skills: Skill[] = [
    "exploration",
    "perception",
    "social",
    "engineering",
  ];
  function checkSkillVisibility(skill: Skill, s: GameState) {
    // TODO: refactor this bs, dont force redraws
    return s.data.global.stats[skill] > 0 || s.data.run.stats[skill] > 0;
  }
  let bakedLocation: { text: string | null; show: boolean } = {
    text: null,
    show: false,
  };

  $: if ($knowledgeSignal !== null || $subLocationSignal !== null) {
    tryBakeLocation(get(gameState));
  }
  function tryBakeLocation(state: GameState) {
    bakedLocation = LOCATION_CHECKS[state.data.run.location](state);
  }
</script>

<main class="h-screen">
  {#if $endRun}
    <EndRun />
  {/if}
  <div class="grid h-full grid-cols-12 grid-rows-[auto_1fr_auto]">
    <!-- Top header -->
    <div class="col-span-12 grid grid-cols-12 text-center p-2">
      <div class="col-span-12 pixel-corners bg-slate-900">
        <div>{formatTime($gameState.data.run.timeSpent)}</div>
        <div>
          <GenericIcon icon={"bolt"} />
          <span
            >{$gameState.data.run.currentEnergy.toFixed(2)} / {$gameState.data.run.maxEnergy.toFixed(
              2
            )}</span
          >
          <span class="text-sm text-slate-400"
            >(-{$gameState.data.run.energyDecayRate.toFixed(2)}/s)</span
          >
        </div>
        <div>
          <ProgressBar
            percent={($gameState.data.run.currentEnergy /
              $gameState.data.run.maxEnergy) *
              100}
          />
        </div>
      </div>

      <div class="col-span-12 grid grid-cols-4 space-x-1 mt-2">
        {#each skills as skill}
          {@const invisible = !checkSkillVisibility(skill, $gameState)}
          <div
            class="transition-all duration-500"
            class:invisible
            class:opacity-0={invisible}
          >
            <SkillBar {skill} />
          </div>
        {/each}
      </div>
      <div
        class="col-span-12 grid grid-cols-12 space-x-1 mt-2 bg-slate-900 pixel-corners text-center transition-all"
        class:invisible={!bakedLocation.show}
        class:opacity-0={!bakedLocation.show}
      >
        <div class="col-span-12">
          {bakedLocation.text ?? "NO LOCATION DATA"}
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="col-span-12 grid grid-cols-12 border-b-2 border-b-slate-400 overflow-hidden flex-col"
    >
      <!-- Left main view -->
      <div class="col-span-9 overflow-hidden px-2">
        <Router
          routingSettings={{
            actions: Actions,
          }}
          currentRoute={$gameState.data.run.mainViewRoute}
        />
      </div>

      <!-- Log view -->
      <div class="col-span-3 h-full overflow-hidden flex flex-col px-2">
        <div class="overflow-y-auto flex-1">
          {#each $gameState.data.run.logEntries.reverse() as { ts, text }}
            <div
              class="border-b-2 mb-2 pixel-corners bg-slate-900 px-3 text-sm"
            >
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
