<script lang="ts">
  import Router from "./Router.svelte";
  import Actions from "./routes/Actions.svelte";
  import {
    anchorItems,
    gameState,
    endRun,
    knowledgeSignal,
    RUN_DEATH_COLLAPSE_MS,
    RUN_DEATH_REVEAL_MS,
    RUN_LOOP_COVER_MS,
    RUN_LOOP_REVEAL_MS,
    runDeathTransition,
    runLoopTransition,
    subLocationSignal,
  } from "./state";
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
  import type { GameState, Location, Skill } from "./types";
  import { LOCATIONS } from "./gameData/sublocations";
  import SkillBar from "./parts/SkillBar.svelte";
  import Button from "./components/Button.svelte";
  import { fade } from "svelte/transition";
  import { derived, get } from "svelte/store";
  import EndRun from "./routes/EndRun.svelte";
  import Retracing from "./routes/Retracing.svelte";
  import EndRunStats from "./parts/EndRunStats.svelte";
  import {
    applyAnchorLeap,
    getPostLeapEnergyDecayRate,
    type AnchorInventoryItem,
  } from "./system/leap";
  import { distinctArrayProjection } from "./system/store";

  const LOCATION_ACCENTS: Record<Location, string> = {
    [LOCATIONS.na641]: "var(--ui_accent_new_arcadia)",
    [LOCATIONS.bbasin7281]: "var(--ui_accent_ashbone_basin)",
  };

  function checkSkillVisibility(skill: Skill, s: GameState) {
    return s.data.global.stats[skill] > 0 || s.data.run.stats[skill] > 0;
  }

  function arrangeSkillRows(visible: readonly Skill[]): Skill[][] {
    const rows: Skill[][] = [];
    let offset = 0;

    while (offset < visible.length) {
      const remaining = visible.length - offset;
      const rowsRemaining = Math.ceil(remaining / 5);
      const rowSize = Math.min(
        5,
        Math.ceil((remaining + rowsRemaining - 1) / rowsRemaining),
      );

      rows.push(visible.slice(offset, offset + rowSize));
      offset += rowSize;
    }

    return rows;
  }

  let bakedLocation: { text: string | null; show: boolean } = {
    text: null,
    show: false,
  };
  let showLeapModal = false;
  const visibleSkills = distinctArrayProjection(
    gameState,
    (state) => skills.filter((skill) => checkSkillVisibility(skill, state)),
  );
  const visibleSkillRows = derived(visibleSkills, arrangeSkillRows);

  $: if ($anchorItems.length === 0 && showLeapModal) {
    showLeapModal = false;
  }
  $: endRunLocationName = getEndRunLocationName($gameState);
  $: activeAccent = $endRun
    ? "var(--ui_progress_time_compression)"
    : LOCATION_ACCENTS[$gameState.data.run.location];
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

</script>

<main
  class="app_shell h-screen"
  class:death_transition_collapse={$runDeathTransition === "collapse"}
  class:death_transition_reveal={$runDeathTransition === "reveal"}
  class:loop_transition_cover={$runLoopTransition === "cover"}
  class:loop_transition_reveal={$runLoopTransition === "reveal"}
  style={`--ui_accent: ${activeAccent}; --death-collapse-duration: ${RUN_DEATH_COLLAPSE_MS}ms; --death-reveal-duration: ${RUN_DEATH_REVEAL_MS}ms; --loop-cover-duration: ${RUN_LOOP_COVER_MS}ms; --loop-reveal-duration: ${RUN_LOOP_REVEAL_MS}ms`}
>
  {#if showLeapModal}
    <div
      class="app_backdrop absolute inset-0 z-20 grid place-items-center"
      in:fade
      out:fade={{ duration: 100 }}
    >
      <div class="glass_surface glass_modal">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-9 text-left text-lg font-semibold">Leap</div>
          <Button
            className="col-span-3 py-1"
            on:click={() => (showLeapModal = false)}
          >
            Close
          </Button>
          <div class="glass_stat muted_text col-span-12 text-left text-sm">
            Energy consumption doubles:
            <span class="primary_text"
              >{formatDecayRate($gameState.data.run.energyDecayRate)}/s</span
            >
            ->
            <span class="primary_text"
              >{formatDecayRate(
                getPostLeapEnergyDecayRate($gameState.data.run.energyDecayRate),
              )}/s</span
            >
          </div>
          {#each $anchorItems as anchorItem (anchorItem.itemId)}
            <Button
              className="col-span-12 text-left"
              active
              accent={LOCATION_ACCENTS[anchorItem.anchor.location]}
              on:click={() => selectLeapDestination(anchorItem)}
            >
              {anchorItem.anchor.sublocation}
            </Button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  <div
    class="app_stage grid h-full grid-cols-12 grid-rows-[auto_1fr_auto]"
  >
    <!-- Top header -->
    <div class="col-span-12 grid grid-cols-12 text-center p-2">
      <div class="run_status_bar glass_surface col-span-12">
        {#if $endRun}
          <div class="muted_text px-3 py-2 text-sm">
            Energy ran out after {formatTime($endRun.timeSpent)}
          </div>
        {:else}
          <div class="px-3 py-2">
            <div>{formatTime($gameState.data.run.timeSpent)}</div>
            <div>
              <GenericIcon icon={"bolt"} />
              <span
                >{$gameState.data.run.currentEnergy.toFixed(2)} / {$gameState.data.run.maxEnergy.toFixed(
                  2,
                )}</span
              >
              <span class="muted_text text-sm"
                >(-{$gameState.data.run.energyDecayRate.toFixed(2)}/s)</span
              >
            </div>
          </div>
          <div class="glass_content_clip_bottom">
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
          {#each $visibleSkillRows as skillRow}
            <div
              class="grid gap-x-1"
              class:grid-cols-1={skillRow.length === 1}
              class:grid-cols-2={skillRow.length === 2}
              class:grid-cols-3={skillRow.length === 3}
              class:grid-cols-4={skillRow.length === 4}
              class:grid-cols-5={skillRow.length === 5}
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
          <div class="glass_card col-span-12 flex items-center justify-center py-1">
            <span>{endRunLocationName}</span>
          </div>
        {:else}
          {#if $anchorItems.length > 0}
            <button
              type="button"
              class="glass_control col-span-3 px-3 py-1"
              data-active="true"
              on:click={() => (showLeapModal = true)}
            >
              Leap
            </button>
          {/if}
          <div
            class={$anchorItems.length > 0
              ? "glass_card col-span-9 flex items-center justify-center py-1"
              : "glass_card col-span-12 flex items-center justify-center py-1"}
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
      <div class="glass_surface grid grid-cols-12 px-3 py-2">
        <div class="subtle_text col-span-12 text-sm">
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

  {#if $runDeathTransition !== "idle"}
    <div class="death_transition_fx" aria-hidden="true">
      <div class="death_transition_vignette"></div>
      <div class="death_transition_blackout"></div>
    </div>
  {/if}

  {#if $runLoopTransition !== "idle"}
    <div class="loop_transition_fx" aria-hidden="true">
      <div class="loop_transition_veil"></div>
    </div>
  {/if}
</main>

<style>
  main {
    height: 100%;
  }

  .app_shell {
    position: relative;
    overflow: hidden;
    font-size: var(--ui_font_size_body);
    background:
      linear-gradient(135deg, rgb(var(--ui_accent) / 4%), transparent 42%),
      linear-gradient(180deg, var(--ui_page_soft), var(--ui_page));
  }

  .run_status_bar {
    font-size: var(--ui_font_size_status);
  }

  :is(.death_transition_collapse, .death_transition_reveal, .loop_transition_cover, .loop_transition_reveal) .app_stage {
    pointer-events: none;
  }

  .death_transition_collapse .app_stage {
    animation: time_collapse var(--death-collapse-duration)
      cubic-bezier(0.55, 0, 0.9, 0.55) both;
  }

  .death_transition_reveal .app_stage {
    animation: time_reveal var(--death-reveal-duration)
      cubic-bezier(0.16, 0.82, 0.32, 1) both;
  }

  .loop_transition_cover .app_stage {
    animation: loop_cover var(--loop-cover-duration) ease-in both;
  }

  .loop_transition_reveal .app_stage {
    animation: loop_reveal var(--loop-reveal-duration) ease-out both;
  }

  .death_transition_fx,
  .death_transition_fx > div,
  .loop_transition_fx,
  .loop_transition_veil {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  :is(.death_transition_fx, .loop_transition_fx) {
    z-index: 50;
    overflow: hidden;
  }

  .loop_transition_veil {
    background: radial-gradient(
      ellipse at 50% 12%,
      rgb(var(--ui_progress_time_compression) / 15%) 0%,
      rgb(6 4 10 / 96%) 58%,
      rgb(2 2 3 / 99%) 100%
    );
    opacity: 0;
  }

  .loop_transition_cover .loop_transition_veil {
    animation: loop_veil var(--loop-cover-duration) ease-in both;
  }

  .loop_transition_reveal .loop_transition_veil {
    animation: loop_veil var(--loop-reveal-duration) ease-out reverse both;
  }

  .death_transition_vignette {
    background: radial-gradient(
      ellipse at 50% 10%,
      transparent 0 16%,
      rgb(0 2 2 / 38%) 55%,
      rgb(0 0 0 / 92%) 100%
    );
    opacity: 0;
  }

  .death_transition_collapse .death_transition_vignette {
    animation: time_vignette_collapse var(--death-collapse-duration) ease-in
      both;
  }

  .death_transition_reveal .death_transition_vignette {
    animation: time_vignette_release var(--death-reveal-duration) ease-out both;
  }

  .death_transition_blackout {
    background: #010202;
    opacity: 0;
  }

  .death_transition_collapse .death_transition_blackout {
    animation: time_blackout var(--death-collapse-duration) ease-in both;
  }

  .death_transition_reveal .death_transition_blackout {
    animation: time_blackout_release var(--death-reveal-duration) ease-in-out
      both;
  }

  :global(.death_transition_collapse :is(.glass_surface, .glass_menu, .glass_card, .glass_control)::after) {
    animation: time_edge_heartbeat var(--death-collapse-duration) ease-in both;
  }

  :global(.death_transition_reveal :is(.glass_surface, .glass_menu, .glass_card, .glass_control)::after) {
    animation: time_panel_purple_bloom var(--death-reveal-duration) ease-in-out
      both;
  }

  :global(.loop_transition_reveal :is(.glass_surface, .glass_menu, .glass_card, .glass_control)::after) {
    animation: loop_edge_pop var(--loop-reveal-duration) ease-out both;
  }

  @keyframes time_collapse {
    0% {
      opacity: 1;
      filter: brightness(1) saturate(1);
    }
    18% {
      filter: brightness(1.02) saturate(0.92);
    }
    58% {
      opacity: 0.92;
      filter: brightness(0.78) saturate(0.6);
    }
    86% {
      opacity: 0.42;
      filter: brightness(0.38) saturate(0.32);
    }
    100% {
      opacity: 0.04;
      filter: brightness(0.12) saturate(0.1);
    }
  }

  @keyframes time_reveal {
    0% {
      opacity: 0.04;
      filter: brightness(0.15) saturate(0.2);
    }
    44% {
      opacity: 0.82;
      filter: brightness(0.78) saturate(1.08);
    }
    100% {
      opacity: 1;
      filter: none;
    }
  }

  @keyframes time_vignette_collapse {
    0%,
    18% {
      opacity: 0;
    }
    72% {
      opacity: 0.56;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes time_vignette_release {
    0% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes time_blackout {
    0%,
    88.8% {
      opacity: 0;
    }
    100% {
      opacity: 0.98;
    }
  }

  @keyframes time_blackout_release {
    0% {
      opacity: 0.98;
    }
    5.34%,
    100% {
      opacity: 0;
    }
  }

  @keyframes time_edge_heartbeat {
    0% {
      opacity: 1;
      filter: brightness(1);
    }
    18% {
      opacity: 1;
      filter: brightness(1.55)
        drop-shadow(0 0 4px rgb(var(--ui_accent) / 34%));
    }
    50% {
      opacity: 0.78;
      filter: brightness(1.12)
        drop-shadow(0 0 2px rgb(var(--ui_accent) / 16%));
    }
    100% {
      opacity: 0.08;
      filter: brightness(0.3);
    }
  }

  @keyframes time_panel_purple_bloom {
    0%,
    24% {
      opacity: 0.34;
      filter: brightness(0.72);
    }
    52% {
      opacity: 1;
      filter: brightness(1.28)
        drop-shadow(
          0 0 4px rgb(var(--ui_progress_time_compression) / 24%)
        );
    }
    76% {
      opacity: 0.92;
      filter: brightness(1.06);
    }
    100% {
      opacity: 1;
      filter: none;
    }
  }

  @keyframes loop_cover {
    from {
      opacity: 1;
      filter: brightness(1) saturate(1);
    }
    to {
      opacity: 0.22;
      filter: brightness(0.34) saturate(0.52);
    }
  }

  @keyframes loop_reveal {
    0% {
      opacity: 0.18;
      filter: brightness(0.42) saturate(0.62);
    }
    62% {
      opacity: 1;
      filter: brightness(1.03) saturate(1.05);
    }
    100% {
      opacity: 1;
      filter: none;
    }
  }

  @keyframes loop_veil {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.99;
    }
  }

  @keyframes loop_edge_pop {
    0%,
    18% {
      opacity: 0.42;
      filter: brightness(0.76);
    }
    58% {
      opacity: 1;
      filter: brightness(1.38)
        drop-shadow(0 0 4px rgb(var(--ui_accent) / 28%));
    }
    100% {
      opacity: 1;
      filter: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :is(.death_transition_collapse, .loop_transition_cover) .app_stage {
      animation: none;
    }

    :is(.death_transition_reveal, .loop_transition_reveal) .app_stage {
      animation: time_reduced_reveal 160ms ease-out both;
    }

    .death_transition_fx > div,
    :global(:is(.death_transition_collapse, .death_transition_reveal, .loop_transition_reveal) :is(.glass_surface, .glass_menu, .glass_card, .glass_control)::after) {
      animation: none;
    }
  }

  @keyframes time_reduced_reveal {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
