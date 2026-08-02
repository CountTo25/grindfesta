<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import Button from "../components/Button.svelte";
  import ScrollFade from "../components/ScrollFade.svelte";
  import GenericIcon from "../parts/GenericIcon.svelte";
  import ProgressBar from "../parts/ProgressBar.svelte";
  import RetracingNode from "../parts/RetracingNode.svelte";
  import {
    bakeStateSnapshot,
    BASE_TPS,
    canSkipUnavailableRetraceAction,
    canStartAction,
    completeSimulatedAction,
    endRun,
    gameState,
    ghostDisplayableActions,
    simulateActionProgress,
  } from "../state";
  import { actions } from "../statics";
  import { EMPTY_RUN, GameState } from "../types";
  import {
    bundleAdjacentBy,
    deepClone,
    formatTime,
    resolveActionText,
  } from "../utils";

  const RETRACE_TICK_MS = 1000 / BASE_TPS;
  const MAX_RETRACE_SIM_TICKS = 1_000_000;

  type RetracedRecord = {
    id: string;
  };

  let knownNodes = $gameState.data.global.completedActionHistory;
  let retraceWarning: string | null = null;
  let retraceRecording: RetracedRecord[] = deepClone(
    get(gameState).data.global.retraceConfig,
  );
  let fake: GameState = buildFakeState();

  $: displayableActions = ghostDisplayableActions(fake).filter(
    (v) => knownNodes.includes(v) && canStartAction(fake, v),
  );
  $: fakeEnergyPercent = Math.max(
    0,
    Math.min(100, (fake.data.run.currentEnergy / fake.data.run.maxEnergy) * 100),
  );
  $: bundledRetracedNodes = bundleAdjacentBy(
    retraceRecording,
    ({ id }) => id,
  );
  $: reversedBundledRetracedNodes = bundledRetracedNodes.slice().reverse();

  onMount(() => handleRetraceAll());

  function buildFakeState() {
    const next = deepClone(get(gameState));
    next.data.run = deepClone(EMPTY_RUN);
    return bakeStateSnapshot(next);
  }

  function actionTitle(id: string) {
    return resolveActionText(actions[id].title, fake);
  }

  function simulateAction(id: string) {
    if (!actions[id] || !canStartAction(fake, id)) {
      if (canSkipUnavailableRetraceAction(id)) {
        return true;
      }
      retraceWarning = "Retrace stopped: planned action is no longer available.";
      return false;
    }

    const tickBudget = { remaining: MAX_RETRACE_SIM_TICKS };
    const result = simulateActionProgress(
      fake,
      id,
      RETRACE_TICK_MS,
      tickBudget,
    );
    fake = result.state;
    if (!result.completed) {
      retraceWarning =
        fake.data.run.currentEnergy <= 0
          ? "Retrace stopped: energy would run out here."
          : "Retrace stopped: simulation took too long.";
      return false;
    }

    fake = completeSimulatedAction(fake, id);
    return true;
  }

  function handleRetraceAll(newId: string | null = null) {
    fake = buildFakeState();
    retraceWarning = null;

    const records = [...retraceRecording];
    if (newId) {
      records.push({ id: newId });
    }

    const nextRecording: RetracedRecord[] = [];
    for (const record of records) {
      const before = deepClone(fake);
      if (!simulateAction(record.id)) {
        fake = before;
        break;
      }
      nextRecording.push(record);
    }

    retraceRecording = nextRecording;
    fake = fake;
  }

  function saveRetracing() {
    $gameState.data.global.retraceConfig = retraceRecording.map(({ id }) => ({
      id,
    }));
    if ($endRun) $endRun.mainViewRoute = "endRun";
  }

  function clearRetracing() {
    $gameState.data.global.retraceConfig = [];
    retraceRecording = [];
    handleRetraceAll();
  }
</script>

<div
  class="h-full min-h-0 grid grid-rows-[auto_1fr_auto] overflow-hidden px-2"
  data-testid="retracing-view"
>
  <div
    class="glass_surface grid grid-cols-12 gap-x-3 gap-y-2 px-4 py-3"
  >
    <div class="muted_text col-span-6 text-xs sm:col-span-2">
      Planned time
      <div class="primary_text">{formatTime(fake.data.run.timeSpent)}</div>
    </div>
    <div class="muted_text col-span-6 text-xs sm:col-span-2">
      Actions
      <div class="primary_text">{retraceRecording.length}</div>
    </div>
    <div class="muted_text col-span-12 text-xs sm:col-span-8">
      Simulated energy
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <ProgressBar percent={fakeEnergyPercent} tone="simulated_energy" />
        </div>
        <div class="primary_text min-w-28 text-right text-sm">
          {fake.data.run.currentEnergy.toFixed(2)} / {fake.data.run.maxEnergy.toFixed(2)}
        </div>
      </div>
    </div>
  </div>

  <div class="min-h-0 grid grid-cols-12 overflow-hidden pt-2">
    <ScrollFade
      frameClass="glass_divider_right col-span-4 min-h-0 sm:col-span-3"
      scrollerClass="glass_scroll h-full overflow-y-auto"
    >
      <div class="glass_kicker px-3 pb-2">Timeline</div>
      <div class="px-2">
        {#if reversedBundledRetracedNodes.length === 0}
          <div class="subtle_text px-1 py-2 text-xs">
            No retrace actions yet
          </div>
        {/if}
        {#each reversedBundledRetracedNodes as record, idx}
          <div
            class="glass_card mb-2 grid grid-cols-5 p-2 text-sm"
          >
            <div class="col-span-4 min-w-0">
              <div class="truncate">{actionTitle(record.id)}</div>
              {#if record.count > 1}
                <div class="subtle_text text-xs">x{record.count}</div>
              {/if}
            </div>
            {#if idx === 0}
              <button
                type="button"
                aria-label="Remove last retrace action"
                class="glass_icon_button col-span-1 justify-self-center"
                on:click={() => {
                  retraceRecording.splice(retraceRecording.length - 1, 1);
                  retraceRecording = retraceRecording;
                  handleRetraceAll();
                }}
              >
                <GenericIcon icon="trash" />
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </ScrollFade>

    <ScrollFade
      frameClass="col-span-8 min-h-0 sm:col-span-9"
      scrollerClass="glass_scroll grid h-full auto-rows-min grid-cols-12 content-start gap-2 overflow-auto pl-3 pr-1"
    >
      {#if retraceWarning}
        <div
          class="col-span-12 mb-1 border-b border-amber-300/30 pb-2 text-sm text-amber-300"
        >
          {retraceWarning}
        </div>
      {/if}
      {#if displayableActions.length === 0}
        <div class="subtle_text col-span-12 text-sm">
          No valid known actions from this simulated point
        </div>
      {/if}
      {#each displayableActions as node}
        <div class="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3">
          <RetracingNode
            action={actions[node]}
            on:click={() => handleRetraceAll(node)}
          />
        </div>
      {/each}
    </ScrollFade>
  </div>

  <div class="glass_divider_top grid grid-cols-12 gap-2 py-2 text-center">
    <Button
      testId="save-retracing"
      on:click={saveRetracing}
      className="col-span-5">Save plan</Button
    >
    <Button
      on:click={clearRetracing}
      className="col-span-3">Clear</Button
    >
    <Button
      className="col-span-4"
      on:click={() => $endRun && ($endRun.mainViewRoute = "endRun")}>Back</Button
    >
  </div>
</div>
