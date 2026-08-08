<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import { getLocationAccentByKey } from "../gameData/locationAccents";
  import { milestones, type Milestone } from "../gameData/milestones";
  import MilestoneTime from "../parts/MilestoneTime.svelte";
  import { endRun, gameState } from "../state";

  $: worldEntries = (
    $endRun?.logEntries ?? $gameState.data.run.logEntries
  ).slice(-12);
  $: milestoneEntries = (
    $endRun?.milestoneEntries ?? $gameState.data.run.milestoneEntries
  ).toReversed();
  $: previousMilestoneTimes = new Map(
    $gameState.data.global.last_run_milestone_entries.map(({ id, ts }) => [
      id,
      ts,
    ]),
  );

  function isImportant(milestone: Milestone) {
    return milestone.important === true;
  }
</script>

<aside
  class="timeline_split col-span-3 grid h-full min-h-0 gap-1 overflow-hidden"
>
  <section class="glass_surface flex min-h-0 flex-col overflow-hidden p-2">
    <h2 class="section_header">
      <span>World</span>
    </h2>
    {#if worldEntries.length > 0}
      <div class="relative min-h-0 flex-1 overflow-hidden text-xs">
        <div class="absolute inset-x-3 bottom-2 flex flex-col gap-1">
          {#each worldEntries as { text }, index}
            <div
              style:opacity={Math.max(
                0.28,
                1 - (worldEntries.length - index - 1) * 0.18,
              )}
            >
              {text}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </section>

  <section class="min-h-0 overflow-hidden">
    <ScrollFade
      frameClass="h-full min-h-0"
      scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
    >
      {#each milestoneEntries as { ts, id } (id)}
        {@const milestone = milestones[id]}
        <article
          class="glass_card mb-2 px-3 py-3"
          style={`--ui_accent: ${getLocationAccentByKey(milestone.location)}`}
        >
          <div>
            <div class="absolute right-0 top-0">
              <MilestoneTime
                time={ts}
                previousTime={previousMilestoneTimes.get(id) ?? null}
              />
            </div>
            <h2
              class="milestone_title pr-24 font-semibold"
              class:milestone_title_important={isImportant(milestone)}
            >
              {milestone.title}
            </h2>
            <p class="muted_text mt-2 text-sm">{milestone.text}</p>
          </div>
        </article>
      {/each}
    </ScrollFade>
  </section>
</aside>

<style>
  .timeline_split {
    grid-template-rows: minmax(0, 1fr) minmax(0, 3fr);
  }
</style>
