<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import { achievementEntries } from "../gameData/achievements";
  import { endRun, gameState } from "../state";

  $: unlocked = new Set($gameState.data.global.unlocked_achievements);
  $: newlyUnlocked = new Set($endRun?.newlyUnlockedAchievements ?? []);
</script>

<section
  class="glass_surface flex h-full min-h-0 flex-col overflow-hidden p-2"
  data-testid="end-run-achievements"
>
  <h2 class="section_header">
    <span>Achievements</span>
    <span class="section_header_meta">
      {unlocked.size} / {achievementEntries.length}
    </span>
  </h2>

  <ScrollFade
    frameClass="min-h-0 flex-1"
    scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
  >
    <div class="grid grid-cols-2 gap-1">
      {#each achievementEntries as [id, achievement] (id)}
        {@const earned = unlocked.has(id)}
        {@const isNew = newlyUnlocked.has(id)}
        <article
          class="achievement_card glass_card min-w-0 px-3 py-3"
          class:achievement_card_unlocked={earned}
          class:achievement_card_new={isNew}
          data-testid={`achievement-${id}`}
          data-unlocked={earned}
          data-new={isNew}
        >
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="achievement_title min-w-0 font-semibold">
              {achievement.title}
            </h3>
            <span class="achievement_status glass_kicker shrink-0">
              {isNew ? "New" : earned ? "Earned" : "Locked"}
            </span>
          </div>
          <p class="muted_text mt-2 text-xs">
            {achievement.description}
          </p>
        </article>
      {/each}
    </div>
  </ScrollFade>
</section>

<style>
  .achievement_card {
    --ui_accent: 238 247 241;
    --glass-edge-color: rgb(238 247 241 / 8%);
    --glass-highlight-alpha: 2%;
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(238 247 241 / 2%),
      transparent
    );
    color: var(--ui_text_subtle);
    opacity: 0.64;
    transition:
      color 240ms ease,
      opacity 240ms ease,
      box-shadow 320ms ease;
  }

  .achievement_title {
    color: var(--ui_text_subtle);
    transition:
      color 260ms ease,
      text-shadow 320ms ease;
  }

  .achievement_status {
    color: var(--ui_text_subtle);
  }

  .achievement_card_unlocked {
    --ui_accent: var(--ui_progress_time_compression);
    --glass-edge-color: rgb(var(--ui_accent) / 58%);
    --glass-highlight-alpha: 7%;
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(var(--ui_accent) / 20%),
      rgb(var(--ui_accent) / 7%)
    );
    color: var(--ui_text);
    opacity: 1;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 18%),
      0 0 0 1px rgb(var(--ui_accent) / 12%),
      0 12px 30px rgb(var(--ui_accent) / 12%);
  }

  .achievement_card_unlocked .achievement_title,
  .achievement_card_unlocked .achievement_status {
    color: rgb(var(--ui_progress_time_compression));
  }

  .achievement_card_unlocked .achievement_title {
    text-shadow:
      0 0 5px rgb(var(--ui_progress_time_compression) / 42%),
      0 0 14px rgb(var(--ui_progress_time_compression) / 22%);
  }

  .achievement_card_new {
    animation: achievement_unlock 700ms ease-out both;
  }

  @keyframes achievement_unlock {
    0% {
      transform: translateY(4px);
      box-shadow: 0 0 0 rgb(var(--ui_progress_time_compression) / 0%);
    }
    55% {
      box-shadow: 0 0 32px rgb(var(--ui_progress_time_compression) / 30%);
    }
    100% {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .achievement_card_new {
      animation: none;
    }
  }
</style>
