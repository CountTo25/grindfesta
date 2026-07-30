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
</script>

{#if isHovered}
  <div
    class="fixed inset-0 z-10 pointer-events-none backdrop-blur-[2px] bg-slate-950/20"
    in:fade={{ duration: 250 }}
    out:fade={{ duration: 20 }}
  ></div>
{/if}

<div
  class="relative w-full"
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => (isHovered = false)}
  class:z-30={isHovered}
>
  <!-- main -->
  <div class="pixel-corners bg-slate-900 grid grid-cols-8 w-full relative">
    <div class="col-span-8 grid grid-cols-8 p-2">
      <div class="col-span-1 text-center">
        <SkillIcon {skill} />
      </div>
      <div class="col-span-4 text-left">
        {skill.slice(0, 1).toUpperCase() + skill.slice(1)}
      </div>
      <div class="col-span-3 text-right">
        x{modifier}
      </div>
    </div>

    <div class="col-span-8">
      <ProgressBar percent={runPercent}></ProgressBar>
    </div>
    <div class="col-span-8">
      <ProgressBar percent={globalPercent}></ProgressBar>
    </div>
  </div>

  {#if isHovered}
    <div
      class="absolute left-0 top-full z-40 mt-1 w-full min-w-full bg-slate-900 text-left p-2 border-2 border-slate-500 pointer-events-none"
      in:fade={{ duration: 120 }}
      out:fade={{ duration: 20 }}
    >
      <div>Run</div>
      <div class="text-slate-300 text-sm">
        x{bakery.modifiers.run[skill].toFixed(2)} modifier from current run
      </div>
      <div class="text-slate-300 text-sm">
        {currentProgressRun.toFixed(2)} / {bakery.toLevel.run.next[
          skill
        ].toFixed(2)} exp to next
      </div>
      <div class="mt-2">Time compression</div>
      <div class="text-slate-300 text-sm">
        x{bakery.modifiers.global[skill].toFixed(2)} modifier from time
        compression
      </div>
      <div class="text-slate-300 text-sm">
        {currentProgressGlobal.toFixed(2)} / {bakery.toLevel.global.next[
          skill
        ].toFixed(2)} exp to next
      </div>
    </div>
  {/if}
</div>
