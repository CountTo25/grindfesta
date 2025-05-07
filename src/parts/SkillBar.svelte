<script lang="ts">
  import { bakery, gameState, bakeSignal } from "../state";
  import type { Skill } from "../types";
  import ProgressBar from "./ProgressBar.svelte";
  import SkillIcon from "./SkillIcon.svelte";
  export let skill: Skill;
  let modifier = bakery.modifiers[skill].toFixed(2);
  $: $bakeSignal != null && (modifier = bakery.modifiers[skill].toFixed(2));
  $: currentProgressRun =
    $gameState.data.run.stats[skill] - bakery.toLevel.run.baseline[skill];
  $: runPercent = (currentProgressRun / bakery.toLevel.run.next[skill]) * 100;
  $: currentProgressGlobal =
    $gameState.data.global.stats[skill] - bakery.toLevel.global.baseline[skill];
  $: globalPercent =
    (currentProgressGlobal / bakery.toLevel.global.next[skill]) * 100;

  $: console.log("got bake signal", $bakeSignal);
</script>

<div class="pixel-corners bg-slate-900 grid grid-cols-6 w-full">
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

  {#key $bakeSignal}
    <div class="col-span-6">
      <ProgressBar percent={runPercent}></ProgressBar>
    </div>
  {/key}
  <div class="col-span-6">
    <ProgressBar percent={globalPercent}></ProgressBar>
  </div>
</div>
