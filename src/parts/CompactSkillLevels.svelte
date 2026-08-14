<script lang="ts">
  import { getBakedSkillsForState } from "../state";
  import type { GameState } from "../types";
  import { skills } from "../utils";
  import GenericIcon from "./GenericIcon.svelte";

  export let state: GameState;

  $: bakedSkills = state.data.run.bakery ?? getBakedSkillsForState(state);
  $: visibleSkills = skills.filter(
    (skill) => bakedSkills.modifiers.total[skill] !== 1,
  );
</script>

{#if visibleSkills.length > 0}
  <div class="compact_skills_panel glass_surface">
    <div class="compact_skills" aria-label="Simulated skill modifiers">
      {#each visibleSkills as skill (skill)}
        <div class="compact_skill glass_card" title={`${skill}: x${bakedSkills.modifiers.total[skill].toFixed(2)}`}>
          <GenericIcon icon={skill} size={13} />
          <span class="compact_skill_name">{skill}</span>
          <span class="compact_skill_modifier">
            x{bakedSkills.modifiers.total[skill].toFixed(2)}
          </span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .compact_skills_panel {
    padding: 5px;
  }

  .compact_skills {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
  }

  .compact_skill {
    display: grid;
    min-width: 0;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 5px;
    padding: 5px 7px;
    font-size: var(--ui_font_size_detail);
  }

  .compact_skill_name {
    overflow: hidden;
    text-transform: capitalize;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compact_skill_modifier {
    color: var(--ui_text_muted);
    font-family: var(--ui_font_numeric);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 800px) {
    .compact_skills {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
