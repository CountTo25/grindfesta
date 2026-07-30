<script lang="ts">
  import { fade } from "svelte/transition";
  import { deepClone, formatTime, getModifier, skills } from "../utils";
  import Button from "../components/Button.svelte";
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
    GLOBAL_LEVEL_MOD_RATIO,
    RUN_SKILL_GAIN_MOD,
    sendSubLocationSignal,
  } from "../state";
  import RetracingNode from "./RetracingNode.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import { actions } from "../statics";
  import { EMPTY_RUN, GameState, type Skill } from "../types";
  import { get } from "svelte/store";

  let isRetracing = false;
  let knownNodes = $gameState.data.global.completedActionHistory;
  let retraceWarning: string | null = null;
  const RETRACE_TICK_MS = 1000 / BASE_TPS;
  const MAX_RETRACE_SIM_TICKS = 1_000_000;

  type RetracedRecord = {
    id: string;
  };

  function showInitStat(t: Skill): number {
    return getModifier($endRun?.initialStats[t] ?? 0, GLOBAL_LEVEL_MOD_RATIO);
  }

  function showEORStat(t: Skill): number {
    return getModifier(bakery.skills.global[t] ?? 0, GLOBAL_LEVEL_MOD_RATIO);
  }

  function doUnwind() {
    $endRun = null;
    sendSubLocationSignal();
  }
  let retraceRecording: RetracedRecord[] = [];
  let fake: GameState = buildFakeState();

  $: displayableActions = ghostDisplayableActions(fake).filter(
    (v) => knownNodes.includes(v) && canStartAction(fake, v)
  );
  $: fakeEnergyPercent = Math.max(
    0,
    Math.min(100, (fake.data.run.currentEnergy / fake.data.run.maxEnergy) * 100)
  );

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

  $: bundledRetracedNodes = bundleRetraced(retraceRecording);
  $: reversedBundledRetracedNodes = bundledRetracedNodes.slice().reverse();

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
        actionDef.weight
      );
      const skillGain = Math.min(
        rawSkillGain,
        progress.progress,
        actionDef.weight
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
    console.log("Rebuild complete. Current Head:", fake.data.run);
  }
</script>

<div
  class="w-full h-full absolute p-10 z-10 backdrop-blur-lg"
  in:fade
  out:fade={{ duration: 100 }}
>
  <div
    class="w-full h-full pixel-corners bg-slate-900 relative flex flex-col p-2"
  >
    {#if !isRetracing}
      <div class="py-2 px-3 h-full">
        <div class="grid grid-cols-12 grid-rows-12 h-full">
          <div class="col-span-12 text-lg text-center row-span-1">
            Energy ran out after {formatTime($endRun!.timeSpent)}
          </div>
          <div class="row-span-10 col-span-12">
            <div class="grid gird-cols-12">
              <div class="col-span-4">
                <div>
                  {#if $gameState.data.run?.initialStats ?? false}
                    {#each skills as skill}
                      {@const initValue = showInitStat(skill)}
                      {@const eorValue = showEORStat(skill)}
                      <div>
                        {String(skill).charAt(0).toUpperCase() +
                          String(skill).slice(1)}
                      </div>
                      <div class="pl-2">
                        <span class="text-slate-300 text-sm">x{initValue}</span>
                        <i class="hn hn-angle-right-solid"></i>
                        <span class:text-emerald-700={eorValue > initValue}
                          >x{eorValue}</span
                        >
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-12 text-center row-span-1">
            {#if $gameState.data.global.loop >= 2}
              <Button
                config={{ classMixins: ["mx-2"] }}
                on:click={() => {
                  isRetracing = true;
                  retraceRecording = deepClone(
                    get(gameState).data.global.retraceConfig
                  );
                  handleRetraceAll(null);
                }}>Setup retracing</Button
              >
            {/if}

            <Button config={{ classMixins: ["mx-2"] }} on:click={doUnwind}
              >Unwind time</Button
            >
          </div>
        </div>
      </div>
    {:else}
      <div
        class="grid grid-cols-12 gap-x-3 gap-y-2 bg-slate-800 border-b-2 border-slate-700 px-3 py-2"
      >
        <div class="col-span-12 sm:col-span-3 text-lg text-slate-100">
          Retracing
        </div>
        <div class="col-span-6 sm:col-span-2 text-xs text-slate-400">
          Planned time
          <div class="text-base text-slate-100">{formatTime(fake.data.run.timeSpent)}</div>
        </div>
        <div class="col-span-6 sm:col-span-2 text-xs text-slate-400">
          Actions
          <div class="text-base text-slate-100">{retraceRecording.length}</div>
        </div>
        <div class="col-span-12 sm:col-span-5 text-xs text-slate-400">
          Sim energy
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <ProgressBar percent={fakeEnergyPercent} rgb={[94, 234, 212]} />
            </div>
            <div class="min-w-24 text-right text-sm text-slate-100">
              {fake.data.run.currentEnergy.toFixed(2)} / {fake.data.run.maxEnergy.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 grid grid-cols-12 min-h-0">
        <div class="col-span-3 border-r-slate-700 border-r-2 overflow-y-auto">
          <div class="px-3 py-2 text-sm text-slate-300 border-b border-slate-700">
            Timeline
          </div>
          <div class="pt-2 px-2">
            {#if reversedBundledRetracedNodes.length === 0}
              <div class="text-xs text-slate-500 px-1 py-2">
                No retrace actions yet
              </div>
            {/if}
            {#each reversedBundledRetracedNodes as record, idx}
              <div
                class="grid grid-cols-5 pixel-corners bg-slate-950 mb-2 p-2 border-b border-slate-700 text-sm"
              >
                <div class="col-span-4 min-w-0">
                  <div class="truncate">{actionTitle(record.id)}</div>
                  {#if record.count > 1}
                    <div class="text-xs text-slate-500">x{record.count}</div>
                  {/if}
                </div>
                {#if idx === 0}
                  <div class="col-span-1">
                    <div
                      class="text-center cursor-pointer"
                      on:click={() => {
                        retraceRecording.splice(retraceRecording.length - 1, 1);
                        retraceRecording = retraceRecording;
                        handleRetraceAll(null);
                      }}
                    >
                      <i class="hn hn-trash-alt"></i>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
        <div
          class="col-span-9 p-3 grid grid-cols-12 auto-rows-min gap-2 overflow-auto content-start"
        >
          {#if retraceWarning}
            <div
              class="col-span-12 text-sm text-amber-300 border-b border-amber-300/30 pb-2 mb-1"
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
                on:click={() => {
                  handleRetraceAll(node);
                }}
              />
            </div>
          {/each}
        </div>
      </div>
      <div
        class="grid grid-cols-12 gap-2 w-full text-center border-t-slate-700 border-t-2 px-2 py-2"
      >
        <Button
          on:click={() => {
            $gameState.data.global.retraceConfig = retraceRecording.map((r) => {
              return { id: r.id };
            });
          }}
          config={{ classMixins: ["col-span-4"] }}>save</Button
        >
        <Button
          on:click={() => {
            $gameState.data.global.retraceConfig = [];
            retraceRecording = [];
            handleRetraceAll(null);
          }}
          config={{ classMixins: ["col-span-4"] }}>clear</Button
        >
        <Button
          config={{ classMixins: ["col-span-4"] }}
          on:click={() => (isRetracing = false)}>exit</Button
        >
      </div>
    {/if}
  </div>
</div>
