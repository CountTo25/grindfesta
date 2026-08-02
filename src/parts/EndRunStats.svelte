<script lang="ts">
  import {
    bakery,
    endRun,
    gameState,
    GLOBAL_LEVEL_MOD_RATIO,
  } from "../state";
  import type { Skill } from "../types";
  import { getModifier, skills } from "../utils";
  import GenericIcon from "./GenericIcon.svelte";

  function showInitStat(t: Skill): number {
    return getModifier($endRun?.initialStats[t] ?? 0, GLOBAL_LEVEL_MOD_RATIO);
  }

  function showEORStat(t: Skill): number {
    return getModifier(bakery.skills.global[t] ?? 0, GLOBAL_LEVEL_MOD_RATIO);
  }

  function formatModifier(value: number): string {
    return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  }

  $: visibleSkills = skills.filter(
    (skill) =>
      $gameState.data.global.stats[skill] > 0 ||
      ($endRun?.stats[skill] ?? 0) > 0,
  );
</script>

<div
  class="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-1"
>
  {#each visibleSkills as skill}
    {@const initValue = showInitStat(skill)}
    {@const eorValue = showEORStat(skill)}
    {@const improved = eorValue > initValue}
    <div
      class="glass_card px-3 py-2"
      data-testid={`result-skill-${skill}`}
    >
      <div class="flex items-center gap-2">
        <GenericIcon icon={skill} />
        <span class="text-sm capitalize">{skill}</span>
      </div>
      <div class="mt-1 flex items-baseline gap-2 pl-6">
        <span class="subtle_text text-xs">x{formatModifier(initValue)}</span>
        <span class="subtle_text"><GenericIcon icon="angle-right-solid" /></span>
        <span
          class:time_compression_gain={improved}
          class:muted_text={!improved}
        >x{formatModifier(eorValue)}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .time_compression_gain {
    color: rgb(var(--ui_progress_time_compression));
    text-shadow: 0 0 10px rgb(var(--ui_progress_time_compression) / 28%);
  }
</style>
