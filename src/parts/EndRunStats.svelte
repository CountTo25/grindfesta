<script lang="ts">
  import {
    bakery,
    endRun,
    gameState,
    GLOBAL_LEVEL_MOD_RATIO,
  } from "../state";
  import type { Skill } from "../types";
  import { getModifier, skills } from "../utils";
  import SkillIcon from "./SkillIcon.svelte";

  function showInitStat(t: Skill): number {
    return getModifier($endRun?.initialStats[t] ?? 0, GLOBAL_LEVEL_MOD_RATIO);
  }

  function showEORStat(t: Skill): number {
    return getModifier(bakery.skills.global[t] ?? 0, GLOBAL_LEVEL_MOD_RATIO);
  }

  function formatModifier(value: number): string {
    return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  }

  function skillTitle(skill: Skill): string {
    return skill.charAt(0).toUpperCase() + skill.slice(1);
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
      class="pixel-corners bg-slate-900 px-3 py-2"
      data-testid={`result-skill-${skill}`}
    >
      <div class="flex items-center gap-2">
        <SkillIcon {skill} />
        <span class="text-sm">{skillTitle(skill)}</span>
      </div>
      <div class="mt-1 flex items-baseline gap-2 pl-6">
        <span class="text-xs text-slate-500">x{formatModifier(initValue)}</span>
        <i class="hn hn-angle-right-solid text-slate-500"></i>
        <span
          class="text-base"
          class:text-emerald-300={improved}
          class:text-slate-300={!improved}
        >x{formatModifier(eorValue)}</span>
      </div>
    </div>
  {/each}
</div>
