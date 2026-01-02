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
  import { actions } from "./statics";
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

  ///What would i give for rust blocks =/
  $: retracingInfo = (() => {
    if ($gameState.data.run.retraceIdx === null) return "";
    let step = $gameState.data.run.retraceIdx;
    let total = $gameState.data.global.retraceConfig.length;
    let { id } = $gameState.data.global.retraceConfig[step] ?? { id: null };
    if (!id) return "";
    // svelte-ignore reactive_declaration_non_reactive_property its non-reactive, chill
    let title = actions[id].title;
    let presentableTitle: String;
    if (typeof title !== "string") {
      presentableTitle = title($gameState);
    } else {
      presentableTitle = title;
    }
    let upNext =
      step <= total
        ? ` up next — <span class="text-white">${presentableTitle}</span>`
        : "";
    return `Retracing: ${step}/${total}${upNext}`;
  })();
  $: retracingInfo2 =
    $gameState.data.run.retraceIdx !== null
      ? `Retracing: ${$gameState.data.run.retraceIdx}/${$gameState.data.global.retraceConfig.length} — up next <span class="text-white">${actions[$gameState.data.global.retraceConfig[$gameState.data.run.retraceIdx]]}</span>`
      : "";
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
          <span>{bakedLocation.text ?? "NO LOCATION DATA"}</span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="col-span-12 grid grid-cols-12 overflow-hidden flex-col">
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
            <div class="mb-2 pixel-corners bg-slate-900 px-3 text-sm">
              <div class="text-right text-slate-500">{formatTime(ts)}</div>
              <div>{text}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="col-span-12 px-2 mb-2">
      <div class="pixel-corners grid grid-cols-12 bg-slate-900 px-2 py-2">
        <div class="col-span-4">{@html retracingInfo}</div>
        <div class="col-span-8 text-sm text-slate-500">
          built @ {__BUILD_TIME__} ({__COMMIT_TITLE__})
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    height: 100%;
  }
</style>
