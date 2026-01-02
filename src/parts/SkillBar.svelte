<script lang="ts">
  import { fade } from "svelte/transition";
  import { bakery, gameState, bakeSignal } from "../state";
  import type { Skill } from "../types";
  import ProgressBar from "./ProgressBar.svelte";
  import SkillIcon from "./SkillIcon.svelte";
  export let skill: Skill;
  let modifier = bakery.modifiers.total[skill].toFixed(2);
  $: $bakeSignal != null &&
    (modifier = bakery.modifiers.total[skill].toFixed(2));
  $: currentProgressRun =
    $gameState.data.run.stats[skill] - bakery.toLevel.run.baseline[skill];
  $: runPercent = (currentProgressRun / bakery.toLevel.run.next[skill]) * 100;
  $: currentProgressGlobal =
    $gameState.data.global.stats[skill] - bakery.toLevel.global.baseline[skill];
  $: globalPercent =
    (currentProgressGlobal / bakery.toLevel.global.next[skill]) * 100;

  let isHovered = false;
  let mainElement!: HTMLDivElement;
</script>

{#if isHovered}
  <div
    class="absolute z-10 backdrop-blur-sm bg-opacity-50 left-0 top-0 w-full h-full pointer-events-none"
    in:fade={{ duration: 250 }}
    out:fade={{ duration: 20 }}
  ></div>
{/if}

<div
  class="relative w-full"
  bind:this={mainElement}
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => (isHovered = false)}
  class:z-20={isHovered}
>
  <!-- main -->
  <div class="pixel-corners bg-slate-900 grid grid-cols-6 w-full relative">
    <div class="col-span-6 grid grid-cols-6 p-2">
      <div class="col-span-1 text-center">
        <SkillIcon {skill} />
      </div>
      <div class="col-span-2 text-left">
        {skill.slice(0, 1).toUpperCase() + skill.slice(1)}
      </div>
      <div class="col-span-3 text-right">
        x{modifier}
      </div>
    </div>

    <div class="col-span-6">
      <ProgressBar percent={runPercent}></ProgressBar>
    </div>
    <div class="col-span-6">
      <ProgressBar percent={globalPercent}></ProgressBar>
    </div>
  </div>
</div>

{#if isHovered}
  <div
    class="absolute bg-slate-900 z-20 text-left mt-2 p-2 border-2 border-slate-500"
    style="width: {mainElement.getBoundingClientRect().width}px"
  >
    <div>Run</div>
    <div class="text-slate-400 text-sm">
      x{bakery.modifiers.run[skill].toFixed(2)} modifier from current run
    </div>
    <div class="text-slate-400 text-sm">
      {currentProgressRun.toFixed(2)} / {bakery.toLevel.run.next[skill].toFixed(
        2
      )} exp to next
    </div>
    <div class="mt-2">Time compression</div>
    <div class="text-slate-400 text-sm">
      x{bakery.modifiers.global[skill].toFixed(2)} modifier from time compression
    </div>
    <div class="text-slate-400 text-sm">
      {currentProgressGlobal.toFixed(2)} / {bakery.toLevel.global.next[
        skill
      ].toFixed(2)} exp to next
    </div>
  </div>
{/if}
