<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import Button from "../components/Button.svelte";
  import ProgressBar from "../parts/ProgressBar.svelte";
  import RetracingNode from "../parts/RetracingNode.svelte";
  import {
    applyRunTickCosts,
    bakeStateSnapshot,
    bakery,
    BASE_GAIN_RATE,
    BASE_TPS,
    canSkipUnavailableRetraceAction,
    canStartAction,
    endRun,
    gameState,
    ghostDisplayableActions,
    GLOBAL_SKILL_GAIN_MOD,
    RUN_SKILL_GAIN_MOD,
  } from "../state";
  import { actions } from "../statics";
  import { EMPTY_RUN, GameState } from "../types";
  import { deepClone, formatTime } from "../utils";

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
  $: bundledRetracedNodes = bundleRetraced(retraceRecording);
  $: reversedBundledRetracedNodes = bundledRetracedNodes.slice().reverse();

  onMount(() => handleRetraceAll());

  function buildFakeState() {
    const next = deepClone(get(gameState));
    next.data.run = deepClone(EMPTY_RUN);
    return bakeStateSnapshot(next);
  }

  function bundleRetraced(records: RetracedRecord[]) {
    const out = [];
    for (const r of records) {
      const last = out[out.length - 1];
      if (last && last.id === r.id) {
        last.count++;
      } else {
        out.push({ id: r.id, count: 1 });
      }
    }
    return out;
  }

  function actionTitle(id: string) {
    const title = actions[id].title;
    return typeof title === "string" ? title : title(fake);
  }

  function completeSimulatedAction(id: string) {
    const runState = fake.data.run;
    const actionDef = actions[id];

    if (!runState.actionProgress[id]) {
      runState.actionProgress[id] = {
        complete: false,
        progress: 0,
      };
    }

    if (!fake.data.global.completedActionHistory.includes(id)) {
      fake.data.global.completedActionHistory.push(id);
    }

    if (!actionDef.repeatable) {
      runState.actionProgress[id].complete = true;
    }

    if (
      actionDef.crossGeneration &&
      !fake.data.global.presistentActionProgress.includes(id)
    ) {
      fake.data.global.presistentActionProgress.push(id);
    }

    if (actionDef.postComplete) {
      const todo = Array.isArray(actionDef.postComplete)
        ? actionDef.postComplete
        : [actionDef.postComplete];

      for (const effect of todo) {
        fake = deepClone(effect(fake));
      }
    }

    if (actionDef.repeatable || actionDef.stopOnRepeat) {
      fake.data.run.actionProgress[id]!.complete = false;
      fake.data.run.actionProgress[id]!.progress = 0;
    }

    fake = bakeStateSnapshot(fake);
  }

  function simulateAction(id: string) {
    const actionDef = actions[id];
    if (!actionDef || !canStartAction(fake, id)) {
      if (canSkipUnavailableRetraceAction(id)) {
        return true;
      }
      retraceWarning = "Retrace stopped: planned action is no longer available.";
      return false;
    }

    if (!fake.data.run.actionProgress[id]) {
      fake.data.run.actionProgress[id] = {
        complete: false,
        progress: 0,
      };
    }

    let ticks = 0;
    while ((fake.data.run.actionProgress[id]?.progress ?? 0) < actionDef.weight) {
      if (ticks++ > MAX_RETRACE_SIM_TICKS) {
        retraceWarning = "Retrace stopped: simulation took too long.";
        return false;
      }

      fake.data.run.timeSpent += RETRACE_TICK_MS;
      fake = applyRunTickCosts(fake, RETRACE_TICK_MS);
      if (fake.data.run.currentEnergy <= 0) {
        retraceWarning = "Retrace stopped: energy would run out here.";
        return false;
      }

      const skillModifier =
        fake.data.run.bakery?.modifiers.total[actionDef.skill] ??
        bakery.modifiers.total[actionDef.skill];
      const actionProgressGain =
        (BASE_GAIN_RATE / BASE_TPS) * skillModifier;
      const progress = fake.data.run.actionProgress[id]!;
      progress.progress += actionProgressGain;

      const rawSkillGain = Math.min(
        Math.max(actionProgressGain, 0),
        actionDef.weight,
      );
      const skillGain = Math.min(
        rawSkillGain,
        progress.progress,
        actionDef.weight,
      );
      fake.data.run.stats[actionDef.skill] += skillGain * RUN_SKILL_GAIN_MOD;
      fake.data.global.stats[actionDef.skill] +=
        skillGain * GLOBAL_SKILL_GAIN_MOD;
      fake = bakeStateSnapshot(fake);
    }

    completeSimulatedAction(id);
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
    class="grid grid-cols-12 gap-x-3 gap-y-2 pixel-corners bg-slate-800 px-3 py-2"
  >
    <div class="col-span-6 text-xs text-slate-400 sm:col-span-2">
      Planned time
      <div class="text-base text-slate-100">{formatTime(fake.data.run.timeSpent)}</div>
    </div>
    <div class="col-span-6 text-xs text-slate-400 sm:col-span-2">
      Actions
      <div class="text-base text-slate-100">{retraceRecording.length}</div>
    </div>
    <div class="col-span-12 text-xs text-slate-400 sm:col-span-8">
      Simulated energy
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <ProgressBar percent={fakeEnergyPercent} rgb={[94, 234, 212]} />
        </div>
        <div class="min-w-28 text-right text-sm text-slate-100">
          {fake.data.run.currentEnergy.toFixed(2)} / {fake.data.run.maxEnergy.toFixed(2)}
        </div>
      </div>
    </div>
  </div>

  <div class="min-h-0 grid grid-cols-12 overflow-hidden pt-2">
    <aside
      class="col-span-4 overflow-y-auto border-r-2 border-r-slate-700 sm:col-span-3"
    >
      <div class="px-3 pb-2 text-sm text-slate-300">Timeline</div>
      <div class="px-2">
        {#if reversedBundledRetracedNodes.length === 0}
          <div class="px-1 py-2 text-xs text-slate-500">
            No retrace actions yet
          </div>
        {/if}
        {#each reversedBundledRetracedNodes as record, idx}
          <div
            class="mb-2 grid grid-cols-5 pixel-corners bg-slate-950 p-2 text-sm"
          >
            <div class="col-span-4 min-w-0">
              <div class="truncate">{actionTitle(record.id)}</div>
              {#if record.count > 1}
                <div class="text-xs text-slate-500">x{record.count}</div>
              {/if}
            </div>
            {#if idx === 0}
              <button
                type="button"
                aria-label="Remove last retrace action"
                class="col-span-1 text-center text-slate-400 hover:text-white"
                on:click={() => {
                  retraceRecording.splice(retraceRecording.length - 1, 1);
                  retraceRecording = retraceRecording;
                  handleRetraceAll();
                }}
              >
                <i class="hn hn-trash-alt"></i>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </aside>

    <section
      class="col-span-8 grid auto-rows-min grid-cols-12 content-start gap-2 overflow-auto pl-3 sm:col-span-9"
    >
      {#if retraceWarning}
        <div
          class="col-span-12 mb-1 border-b border-amber-300/30 pb-2 text-sm text-amber-300"
        >
          {retraceWarning}
        </div>
      {/if}
      {#if displayableActions.length === 0}
        <div class="col-span-12 text-sm text-slate-500">
          No valid known actions from this simulated point
        </div>
      {/if}
      {#each displayableActions as node}
        <div class="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3">
          <RetracingNode
            action={actions[node]}
            id={node}
            retracing_id={node}
            on:click={() => handleRetraceAll(node)}
          />
        </div>
      {/each}
    </section>
  </div>

  <div class="grid grid-cols-12 gap-2 border-t-2 border-t-slate-700 py-2 text-center">
    <Button
      testId="save-retracing"
      on:click={saveRetracing}
      config={{ classMixins: ["col-span-5"] }}>Save plan</Button
    >
    <Button
      on:click={clearRetracing}
      config={{ classMixins: ["col-span-3"] }}>Clear</Button
    >
    <Button
      config={{ classMixins: ["col-span-4"] }}
      on:click={() => $endRun && ($endRun.mainViewRoute = "endRun")}>Back</Button
    >
  </div>
</div>
