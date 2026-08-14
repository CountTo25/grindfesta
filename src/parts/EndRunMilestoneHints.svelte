<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import { getLocationAccentByKey } from "../gameData/locationAccents";
  import type { Milestone } from "../gameData/milestones";
  import {
    pickMilestoneHints,
    type MilestoneHint,
  } from "../system/milestoneHints";

  export let candidates: readonly Milestone[] = [];
  export let discoveredCount = 0;
  export let totalCount = 0;

  const HINT_COUNT = 3;
  let candidateSignature = "";
  let hints: MilestoneHint[] = [];

  $: progressPercentage =
    totalCount === 0 ? 0 : Math.round((discoveredCount / totalCount) * 100);

  $: {
    const nextSignature = candidates.map(({ id }) => id).join("|");
    if (nextSignature !== candidateSignature) {
      candidateSignature = nextSignature;
      hints = pickMilestoneHints(candidates, HINT_COUNT);
    }
  }
</script>

<section
  class="glass_surface flex h-full min-h-0 flex-col overflow-hidden p-2"
  data-testid="end-run-milestone-hints"
>
  <h2 class="section_header">
    <span>Milestone hints</span>
    <span class="section_header_meta" data-testid="milestone-progress">
      {discoveredCount} / {totalCount} · {progressPercentage}%
    </span>
  </h2>

  <ScrollFade
    frameClass="min-h-0 flex-1"
    scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
  >
    <div class="grid gap-1">
      {#each hints as hint (hint.id)}
        <article
          class="hint_card glass_card px-3 py-3"
          style={`--ui_accent: ${getLocationAccentByKey(hint.location)}`}
          data-testid={`milestone-hint-${hint.id}`}
        >
          <p class="text-sm leading-relaxed">{hint.text}</p>
        </article>
      {/each}
    </div>
  </ScrollFade>
</section>

<style>
  .hint_card {
    --glass-edge-color: rgb(var(--ui_accent) / 28%);
    --glass-highlight-alpha: 4%;
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(var(--ui_accent) / 8%),
      transparent
    );
    color: var(--ui_text_subtle);
  }
</style>
