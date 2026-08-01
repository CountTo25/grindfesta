<script lang="ts">
  import Router from "./Router.svelte";
  import Actions from "./routes/Actions.svelte";
  import {
    anchorItems,
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
    getEndRunLocationName,
    LOCATION_CHECKS,
    skills,
  } from "./utils";
  //LOAD
  CONDITION_CHECKS;
  COMPLETION_EFFECTS;
  //
  import ProgressBar from "./parts/ProgressBar.svelte";
  import GenericIcon from "./parts/GenericIcon.svelte";
  import type { GameState, Skill } from "./types";
  import SkillBar from "./parts/SkillBar.svelte";
  import Button from "./components/Button.svelte";
  import { fade } from "svelte/transition";
  import { get } from "svelte/store";
  import EndRun from "./routes/EndRun.svelte";
  import Retracing from "./routes/Retracing.svelte";
  import EndRunStats from "./parts/EndRunStats.svelte";
  import { actions } from "./statics";
  import {
    applyAnchorLeap,
    getPostLeapEnergyDecayRate,
    type AnchorInventoryItem,
  } from "./system/leap";
  function checkSkillVisibility(skill: Skill, s: GameState) {
    // TODO: refactor this bs, dont force redraws
    return s.data.global.stats[skill] > 0 || s.data.run.stats[skill] > 0;
  }
  let bakedLocation: { text: string | null; show: boolean } = {
    text: null,
    show: false,
  };
  let showLeapModal = false;
  let visibleSkills: Skill[] = [];
  let visibleSkillRows: Skill[][] = [];

  $: if ($anchorItems.length === 0 && showLeapModal) {
    showLeapModal = false;
  }
  $: visibleSkills = skills.filter((skill) =>
    checkSkillVisibility(skill, $gameState),
  );
  $: visibleSkillRows =
    visibleSkills.length === 0
      ? []
      : visibleSkills.length > 4
        ? [visibleSkills.slice(0, 3), visibleSkills.slice(3)]
        : [visibleSkills];
  $: endRunLocationName = getEndRunLocationName($gameState);
  $: if ($knowledgeSignal !== null || $subLocationSignal !== null) {
    tryBakeLocation(get(gameState));
  }
  function tryBakeLocation(state: GameState) {
    bakedLocation = LOCATION_CHECKS[state.data.run.location](state);
  }
  function formatDecayRate(rate: number) {
    return rate.toFixed(2).replace(/\.?0+$/, "");
  }

  function selectLeapDestination(anchorItem: AnchorInventoryItem) {
    applyAnchorLeap($gameState, anchorItem);
    showLeapModal = false;
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
</script>

<main class="h-screen">
  {#if showLeapModal}
    <div
      class="absolute inset-0 z-20 grid place-items-center backdrop-blur-sm bg-slate-950/40"
      in:fade
      out:fade={{ duration: 100 }}
    >
      <div
        class="pixel-corners bg-slate-900 border-4 border-slate-700 p-4 w-[min(640px,90vw)]"
      >
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-9 text-left text-lg">Leap</div>
          <Button
            config={{ classMixins: ["col-span-3 py-1"] }}
            on:click={() => (showLeapModal = false)}
          >
            Close
          </Button>
          <div class="col-span-12 pixel-corners bg-slate-950 px-3 py-2 text-left text-sm text-slate-300">
            Energy consumption doubles:
            <span class="text-white"
              >{formatDecayRate($gameState.data.run.energyDecayRate)}/s</span
            >
            ->
            <span class="text-white"
              >{formatDecayRate(
                getPostLeapEnergyDecayRate($gameState.data.run.energyDecayRate),
              )}/s</span
            >
          </div>
          {#each $anchorItems as anchorItem (anchorItem.itemId)}
            <Button
              config={{ classMixins: ["col-span-12 text-left"] }}
              on:click={() => selectLeapDestination(anchorItem)}
            >
              {anchorItem.anchor.sublocation}
            </Button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  <div class="grid h-full grid-cols-12 grid-rows-[auto_1fr_auto]">
    <!-- Top header -->
    <div class="col-span-12 grid grid-cols-12 text-center p-2">
      <div class="col-span-12 pixel-corners bg-slate-900">
        {#if $endRun}
          <div class="py-2 text-sm text-slate-400">
            Energy ran out after {formatTime($endRun.timeSpent)}
          </div>
        {:else}
          <div>{formatTime($gameState.data.run.timeSpent)}</div>
          <div>
            <GenericIcon icon={"bolt"} />
            <span
              >{$gameState.data.run.currentEnergy.toFixed(2)} / {$gameState.data.run.maxEnergy.toFixed(
                2,
              )}</span
            >
            <span class="text-sm text-slate-300"
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
        {/if}
      </div>

      <div class="col-span-12 grid gap-y-1 mt-2">
        {#if $endRun}
          <EndRunStats />
        {:else}
          {#each visibleSkillRows as skillRow}
            <div
              class="grid gap-x-1"
              class:grid-cols-1={skillRow.length === 1}
              class:grid-cols-2={skillRow.length === 2}
              class:grid-cols-3={skillRow.length === 3}
              class:grid-cols-4={skillRow.length >= 4}
            >
              {#each skillRow as skill}
                <SkillBar {skill} />
              {/each}
            </div>
          {/each}
        {/if}
      </div>
      <div
        class="col-span-12 grid grid-cols-12 gap-x-1 mt-2 text-center transition-all"
        class:invisible={!bakedLocation.show && !$endRun}
        class:opacity-0={!bakedLocation.show && !$endRun}
      >
        {#if $endRun}
          <div class="col-span-12 pixel-corners bg-slate-900 py-1">
            <span>{endRunLocationName}</span>
          </div>
        {:else}
          {#if $anchorItems.length > 0}
            <button
              type="button"
              class="col-span-3 pixel-corners bg-slate-900 hover:bg-slate-800 transition-all px-3 py-1"
              on:click={() => (showLeapModal = true)}
            >
              Leap
            </button>
          {/if}
          <div
            class={$anchorItems.length > 0
              ? "col-span-9 pixel-corners bg-slate-900 py-1"
              : "col-span-12 pixel-corners bg-slate-900 py-1"}
          >
            <span>{bakedLocation.text ?? "NO LOCATION DATA"}</span>
            <span></span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Main content -->
    <div class="col-span-12 h-full overflow-hidden">
      <Router
        routingSettings={{
          actions: Actions,
          endRun: EndRun,
          retracing: Retracing,
        }}
        currentRoute={$endRun?.mainViewRoute ?? $gameState.data.run.mainViewRoute}
      />
    </div>

    <!-- Bottom bar -->
    <div class="col-span-12 px-2 mb-2">
      <div class="pixel-corners grid grid-cols-12 bg-slate-900 px-2 py-2">
        <div class="col-span-4">
          {#if !$endRun}
            {@html retracingInfo}
          {/if}
        </div>
        <div class="col-span-8 text-sm text-slate-500">
          built @ {__BUILD_TIME__} (<a
            class="underline"
            target="_blank"
            href="https://github.com/CountTo25/grindfesta/commits/main/"
            >{__COMMIT_TITLE__}</a
          >)
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
