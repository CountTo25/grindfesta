<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import { getLocationAccentByKey } from "../gameData/locationAccents";
  import {
    milestones,
    type Milestone,
    type MilestoneKey,
  } from "../gameData/milestones";
  import {
    LOCATIONS,
    type KnownLocation,
    type LocationKey,
  } from "../gameData/sublocations";
  import { KNOWLEDGE } from "../gameData/tags";
  import {
    resolveUpgradeDescription,
    upgrades,
    type TimeLeapUpgrade,
    type UpgradeKey,
  } from "../gameData/upgrades";
  import MilestoneTime from "../parts/MilestoneTime.svelte";
  import {
    beginNextLoopTransition,
    endRun,
    estimateRetracingPlan,
    gameState,
    purchaseTimeLeapUpgrade,
  } from "../state";

  const MILESTONE_SUMMARY_LEAP_THRESHOLD = 5;
  const allMilestones: readonly Milestone[] = Object.values(milestones);
  const eras = Object.entries(LOCATIONS) as [LocationKey, KnownLocation][];
  const upgradeEntries = Object.entries(upgrades) as [
    UpgradeKey,
    TimeLeapUpgrade,
  ][];

  function getMilestone(id: MilestoneKey): Milestone {
    return milestones[id];
  }

  $: globallyReachedMilestoneIds =
    $gameState.data.global.reached_milestones.toReversed();
  $: retracingEstimate = estimateRetracingPlan($gameState);
  $: runMilestoneTimes = new Map(
    ($endRun?.milestoneEntries ?? []).map(({ id, ts }) => [id, ts]),
  );
  $: reachedMilestoneIds = globallyReachedMilestoneIds.toSorted(
    (left, right) =>
      (runMilestoneTimes.get(left) ?? Number.POSITIVE_INFINITY) -
      (runMilestoneTimes.get(right) ?? Number.POSITIVE_INFINITY),
  );
  $: previousMilestoneTimes = new Map(
    $gameState.data.global.previous_run_milestone_entries.map(({ id, ts }) => [
      id,
      ts,
    ]),
  );
  $: eraProgress = eras.map(([key, name]) => {
    const total = allMilestones.filter(
      (milestone) => milestone.location === key,
    ).length;
    const reached = reachedMilestoneIds.filter(
      (id) => getMilestone(id).location === key,
    ).length;

    return {
      key,
      name,
      undiscovered: Math.max(0, total - reached),
      known:
        key === "na641" ||
        reached > 0 ||
        (key === "bbasin7281" &&
          $gameState.data.global.knowledge.includes(
            KNOWLEDGE.BBASIN7281.visited,
          )),
    };
  }).filter(({ known }) => known);

  function isImportant(milestone: Milestone) {
    return milestone.important === true;
  }

  function formatRetracingSummary() {
    if (retracingEstimate.actionCount === 0) {
      return retracingEstimate.configName
        ? `${retracingEstimate.configName} has no steps`
        : "automation is not set up";
    }

    const stepLabel = retracingEstimate.actionCount === 1 ? "step" : "steps";
    return `${retracingEstimate.configName} — ${retracingEstimate.actionCount} ${stepLabel}, estimated ~${retracingEstimate.estimatedSeconds.toFixed(2)}s`;
  }
</script>

<div class="end_run_layout grid h-full gap-1 overflow-hidden px-2 pb-2">
  <section class="col-span-9 h-full overflow-hidden">
    <div class="end_run_primary grid h-full gap-1">
      <ScrollFade
        frameClass="col-span-6 h-full min-h-0"
        scrollerClass="glass_scroll h-full overflow-y-auto"
      >
        <div class="grid grid-cols-12 gap-2">
          {#if $gameState.data.global.loop >= 2}
            <div class="col-span-12">
              <button
                type="button"
                class="end_run_choice end_run_choice_retracing glass_card interactive_glass"
                data-testid="setup-retracing"
                on:click={() =>
                  $endRun && ($endRun.mainViewRoute = "retracing")}
              >
                <span>Retracing</span>
                <span class="muted_text text-xs">
                  {formatRetracingSummary()}
                </span>
              </button>
            </div>
          {/if}

          <div class="col-span-12">
            <button
              type="button"
              class="end_run_choice end_run_choice_new_run glass_card interactive_glass"
              data-testid="start-next-loop"
              on:click={beginNextLoopTransition}
            >
              Start a new run
            </button>
          </div>
        </div>
      </ScrollFade>

      {#if $gameState.data.global.loop >= MILESTONE_SUMMARY_LEAP_THRESHOLD}
        <section
          class="col-span-3 h-full min-h-0 min-w-0"
          data-testid="end-run-milestones"
        >
          <div class="glass_surface flex h-full min-h-0 flex-col p-2">
            <h2 class="section_header">
              <span>Milestones</span>
              <span class="section_header_meta">{reachedMilestoneIds.length} reached</span>
            </h2>

            <ScrollFade
              frameClass="min-h-0 flex-1"
              scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
            >
              {#each reachedMilestoneIds as id (id)}
                {@const milestone = getMilestone(id)}
                {@const reachedAt = runMilestoneTimes.get(id)}
                <article
                  class="glass_card mb-1 px-3 py-2"
                  style={`--ui_accent: ${getLocationAccentByKey(milestone.location)}`}
                >
                  <div class="flex items-baseline justify-between gap-2">
                    <div
                      class="milestone_title min-w-0 text-sm font-semibold"
                      class:milestone_title_important={isImportant(milestone)}
                    >
                      {milestone.title}
                    </div>
                    <MilestoneTime
                      time={reachedAt ?? null}
                      previousTime={reachedAt === undefined
                        ? null
                        : (previousMilestoneTimes.get(id) ?? null)}
                    />
                  </div>
                  <div class="subtle_text mt-1 truncate text-xs">
                    {LOCATIONS[milestone.location]}
                  </div>
                </article>
              {/each}
            </ScrollFade>

            <div class="glass_divider_top mt-2 pt-2">
              <div class="subtle_text mb-1 px-1 text-xs">
                Undiscovered
              </div>
              {#each eraProgress as era (era.key)}
                <div
                  class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1 py-1 text-xs"
                  style={`--ui_accent: ${getLocationAccentByKey(era.key)}`}
                  data-testid={`undiscovered-${era.key}`}
                >
                  <span class="era_progress_name truncate">{era.name}</span>
                  <span class="subtle_text">{era.undiscovered} left</span>
                </div>
              {/each}
            </div>
          </div>
        </section>
      {/if}
    </div>
  </section>

  {#if $gameState.data.global.loop >= MILESTONE_SUMMARY_LEAP_THRESHOLD}
    <aside
      class="end_run_systems col-span-7 grid h-full min-h-0 gap-1 overflow-hidden"
    >
      <section
        class="glass_surface flex min-h-0 flex-col overflow-hidden p-2"
        data-testid="end-run-upgrades"
      >
        <h2 class="section_header">
          <span>Upgrades</span>
        </h2>
        <ScrollFade
          frameClass="min-h-0 flex-1"
          scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
        >
          <div class="grid grid-cols-2 gap-1">
            {#each upgradeEntries as [id, upgrade] (id)}
              {@const owned = $gameState.data.global.purchased_upgrades.includes(id)}
              <button
                type="button"
                class="upgrade_card glass_card min-w-0 px-3 py-3 text-left"
                class:upgrade_card_available={!owned}
                class:upgrade_card_owned={owned}
                disabled={owned}
                on:click={() => purchaseTimeLeapUpgrade(id)}
              >
                <div class="flex items-baseline justify-between gap-2">
                  <h3 class="upgrade_title min-w-0 font-semibold">
                    {upgrade.title}
                  </h3>
                  {#if !owned}
                    <span class="glass_kicker shrink-0">
                      {upgrade.cost === 0 ? "Activate" : upgrade.cost}
                    </span>
                  {/if}
                </div>
                <p class="muted_text mt-2 text-xs">
                  {resolveUpgradeDescription(upgrade.description)}
                </p>
              </button>
            {/each}
          </div>
        </ScrollFade>
      </section>
    </aside>
  {/if}
</div>

<style>
  .end_run_layout {
    grid-template-columns: repeat(16, minmax(0, 1fr));
  }

  .end_run_primary {
    grid-template-columns: repeat(9, minmax(0, 1fr));
  }

  .end_run_systems {
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  }

  .end_run_choice {
    display: flex;
    width: 100%;
    appearance: none;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;
    padding: 8px 12px;
    color: var(--ui_text);
    text-align: left;
    cursor: pointer;
  }

  .end_run_choice_retracing {
    min-height: 80px;
  }

  .end_run_choice_new_run {
    min-height: 48px;
  }

  .upgrade_card {
    width: 100%;
    appearance: none;
    color: var(--ui_text_subtle);
    transition:
      color 160ms ease,
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .upgrade_title {
    color: var(--ui_text_subtle);
    text-shadow:
      0 0 0 rgb(var(--ui_progress_time_compression) / 0%),
      0 0 0 rgb(var(--ui_progress_time_compression) / 0%);
    transition:
      color 260ms ease,
      text-shadow 320ms ease;
  }

  .upgrade_card_available {
    --ui_accent: 238 247 241;
    --glass-edge-color: rgb(238 247 241 / 9%);
    --glass-highlight-alpha: 2%;
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(238 247 241 / 2%),
      transparent
    );
    cursor: pointer;
  }

  .upgrade_card_available:hover,
  .upgrade_card_available:focus-visible {
    --ui_accent: var(--ui_progress_time_compression);
    --glass-edge-color: rgb(var(--ui_accent) / 68%);
    --glass-glow-alpha: 72%;
    --glass-glow-interior-alpha: 22%;
    --glass-highlight-alpha: 8%;
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(var(--ui_accent) / 25%),
      rgb(var(--ui_accent) / 9%)
    );
    outline: none;
    color: var(--ui_text);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 24%),
      0 0 0 1px rgb(var(--ui_accent) / 18%),
      0 12px 30px rgb(var(--ui_accent) / 18%);
  }

  .upgrade_card_available:hover .upgrade_title,
  .upgrade_card_available:focus-visible .upgrade_title,
  .upgrade_card_owned .upgrade_title {
    color: rgb(var(--ui_progress_time_compression));
    text-shadow:
      0 0 5px rgb(var(--ui_progress_time_compression) / 42%),
      0 0 14px rgb(var(--ui_progress_time_compression) / 22%);
  }

  .upgrade_card_available:active {
    transform: translateY(1px) scale(0.995);
  }

  .upgrade_card_owned {
    --ui_accent: var(--ui_progress_time_compression);
    --glass-edge-color: rgb(var(--ui_accent) / 58%);
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(var(--ui_accent) / 20%),
      rgb(var(--ui_accent) / 7%)
    );
    color: var(--ui_text);
    cursor: default;
  }

  .era_progress_name {
    color: rgb(var(--ui_accent));
  }
</style>
