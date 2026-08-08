<script lang="ts">
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  import { bakedSkills, gameState, type BakedSkills } from "../state";
  import type { Skill } from "../types";
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  type LevelPulseTone = "run" | "time_compression";

  export let skill: Skill;
  let modifier = "";
  let trackedSkill = skill;
  let previousRunLevel = $bakedSkills.skills.run[skill];
  let previousGlobalLevel = $bakedSkills.skills.global[skill];
  let pulseTone: LevelPulseTone | null = null;
  let pulseGeneration = 0;

  async function triggerLevelPulse(tone: LevelPulseTone) {
    const generation = ++pulseGeneration;
    pulseTone = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    await tick();
    if (generation === pulseGeneration) pulseTone = tone;
  }

  function handleSkillBake(baked: BakedSkills, currentSkill: Skill) {
    if (trackedSkill !== currentSkill) {
      trackedSkill = currentSkill;
      previousRunLevel = baked.skills.run[currentSkill];
      previousGlobalLevel = baked.skills.global[currentSkill];
      modifier = baked.modifiers.total[currentSkill].toFixed(2);
      pulseGeneration += 1;
      pulseTone = null;
      return;
    }

    const nextRunLevel = baked.skills.run[currentSkill];
    const nextGlobalLevel = baked.skills.global[currentSkill];
    const runLeveledUp = nextRunLevel > previousRunLevel;
    const globalLeveledUp = nextGlobalLevel > previousGlobalLevel;

    previousRunLevel = nextRunLevel;
    previousGlobalLevel = nextGlobalLevel;
    modifier = baked.modifiers.total[currentSkill].toFixed(2);

    if (globalLeveledUp) {
      void triggerLevelPulse("time_compression");
    } else if (runLeveledUp) {
      void triggerLevelPulse("run");
    }
  }

  function finishLevelPulse(event: AnimationEvent) {
    if (event.target === event.currentTarget) pulseTone = null;
  }

  $: handleSkillBake($bakedSkills, skill);
  $: currentProgressRun =
    $gameState.data.run.stats[skill] - $bakedSkills.toLevel.run.baseline[skill];
  $: runPercent =
    (currentProgressRun / $bakedSkills.toLevel.run.next[skill]) * 100;
  $: currentProgressGlobal =
    $gameState.data.global.stats[skill] -
    $bakedSkills.toLevel.global.baseline[skill];
  $: globalPercent =
    (currentProgressGlobal / $bakedSkills.toLevel.global.next[skill]) * 100;

  let isHovered = false;
</script>

{#if isHovered}
  <div
    class="hover_veil fixed inset-0 z-10 pointer-events-none"
    in:fade={{ duration: 140 }}
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
  <div
    class="glass_card skill_card grid grid-cols-8 w-full relative"
    class:skill_level_pulse={pulseTone !== null}
    class:run_level_pulse={pulseTone === "run"}
    class:time_compression_level_pulse={pulseTone === "time_compression"}
    on:animationend={finishLevelPulse}
  >
    {#if pulseTone !== null}
      <div class="skill_level_pulse_interior" aria-hidden="true"></div>
    {/if}

    <div class="col-span-8 grid grid-cols-8 p-2">
      <div class="col-span-1 text-center">
        <GenericIcon icon={skill} />
      </div>
      <div class="col-span-4 text-left capitalize">{skill}</div>
      <div class="skill_modifier col-span-3 text-right">
        x{modifier}
      </div>
    </div>

    <div class="glass_content_clip_bottom glass_progress_stack col-span-8">
      <ProgressBar percent={runPercent}></ProgressBar>
      <ProgressBar percent={globalPercent} tone="time_compression"></ProgressBar>
    </div>
  </div>

  {#if isHovered}
    <div
      class="glass_menu absolute left-0 top-full z-40 mt-1 w-full min-w-full text-left p-3 pointer-events-none"
      in:fade={{ duration: 120 }}
      out:fade={{ duration: 20 }}
    >
      <div>Run</div>
      <div class="muted_text text-xs">
        x{$bakedSkills.modifiers.run[skill].toFixed(2)} modifier from current run
      </div>
      <div class="muted_text text-xs">
        {currentProgressRun.toFixed(2)} / {$bakedSkills.toLevel.run.next[
          skill
        ].toFixed(2)} exp to next
      </div>
      <div class="mt-2">Time compression</div>
      <div class="muted_text text-xs">
        x{$bakedSkills.modifiers.global[skill].toFixed(2)} modifier from time
        compression
      </div>
      <div class="muted_text text-xs">
        {currentProgressGlobal.toFixed(2)} / {$bakedSkills.toLevel.global.next[
          skill
        ].toFixed(2)} exp to next
      </div>
    </div>
  {/if}
</div>

<style>
  .skill_modifier {
    font-family: var(--ui_font_numeric);
    font-variant-numeric: tabular-nums;
  }

  .run_level_pulse {
    --skill-level-pulse-color: var(--ui_accent);
  }

  .time_compression_level_pulse {
    --skill-level-pulse-color: var(--ui_progress_time_compression);
  }

  .skill_level_pulse {
    animation: skill_level_pulse 750ms both;
  }

  .skill_card > .skill_level_pulse_interior {
    position: absolute;
    pointer-events: none;
    animation: skill_level_glass_pulse 750ms both;
  }

  .skill_card > .skill_level_pulse_interior {
    z-index: 0;
    inset: var(--glass-content-inset);
    border-radius: var(--glass-inner-radius);
    background:
      radial-gradient(
        ellipse at 50% 105%,
        rgb(var(--skill-level-pulse-color) / 24%) 0%,
        rgb(var(--skill-level-pulse-color) / 13%) 34%,
        transparent 72%
      ),
      linear-gradient(
        180deg,
        rgb(var(--skill-level-pulse-color) / 13%),
        rgb(var(--skill-level-pulse-color) / 5%)
      );
    box-shadow:
      inset 0 0 12px rgb(var(--skill-level-pulse-color) / 18%),
      inset 0 0 30px rgb(var(--skill-level-pulse-color) / 12%);
  }

  .skill_level_pulse::after {
    background:
      linear-gradient(
        120deg,
        rgb(255 255 255 / 58%),
        rgb(var(--skill-level-pulse-color) / 92%) 28%,
        rgb(var(--skill-level-pulse-color) / 58%) 72%,
        rgb(255 255 255 / 32%)
      );
    animation: skill_level_glass_pulse 750ms both;
  }

  @keyframes skill_level_pulse {
    0%,
    100% {
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 16%),
        inset 0 -1px 0 rgb(0 0 0 / 22%),
        inset 0 0 24px rgb(var(--skill-level-pulse-color) / 0%),
        0 0 0 1px rgb(var(--skill-level-pulse-color) / 0%),
        0 0 18px rgb(var(--skill-level-pulse-color) / 0%),
        0 0 42px rgb(var(--skill-level-pulse-color) / 0%),
        var(--ui_shadow_tight);
    }

    0% {
      animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    33.333% {
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 24%),
        inset 0 -1px 0 rgb(0 0 0 / 18%),
        inset 0 0 24px rgb(var(--skill-level-pulse-color) / 18%),
        0 0 0 1px rgb(var(--skill-level-pulse-color) / 66%),
        0 0 18px rgb(var(--skill-level-pulse-color) / 44%),
        0 0 42px rgb(var(--skill-level-pulse-color) / 22%),
        var(--ui_shadow_tight);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  @keyframes skill_level_glass_pulse {
    0%,
    100% {
      opacity: 0;
    }

    0% {
      animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    33.333% {
      opacity: 1;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skill_level_pulse {
      animation: none;
    }

    .skill_card > .skill_level_pulse_interior,
    .skill_level_pulse::after {
      animation: none;
    }
  }
</style>
