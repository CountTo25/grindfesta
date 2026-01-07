<script lang="ts">
  import { fade } from "svelte/transition";
  import { deepClone, formatTime, getModifier, skills } from "../utils";
  import Button from "../components/Button.svelte";
  import {
    bakery,
    endRun,
    gameState,
    ghostDisplayableActions,
    GLOBAL_LEVEL_MOD_RATIO,
    sendSubLocationSignal,
  } from "../state";
  import RetracingNode from "./RetracingNode.svelte";
  import { actions } from "../statics";
  import { EMPTY_RUN, GameState, type Skill } from "../types";
  import { get } from "svelte/store";

  let isRetracing = false;
  let knownNodes = $gameState.data.global.completedActionHistory;

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
  let fake: GameState = deepClone(get(gameState));
  fake.data.run = deepClone(EMPTY_RUN);

  $: displayableActions = ghostDisplayableActions(fake).filter((v) => {
    let canExecuteConditions = actions[v].conditions ?? [
      (_: GameState) => true,
    ];
    let canExecute = canExecuteConditions.every((c) => c(fake));

    let revealed = // svelte-ignore reactive_declaration_non_reactive_property
      (actions[v].revealCondition ?? [(_: GameState) => true]).every((c) =>
        c(fake)
      );

    return knownNodes.includes(v) && canExecute && revealed;
  });

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

  $: bundledRetracedNodes = bundleRetraced(retraceRecording);

  function simulateAction(id: string) {
    const runState = fake.data.run;
    const actionDef = actions[id];

    if (!runState.actionProgress[id]) {
      runState.actionProgress[id] = {
        complete: true,
        progress: actionDef.weight,
      };
    } else {
      runState.actionProgress[id].complete = true;
      runState.actionProgress[id].progress = actionDef.weight;
    }

    // 2. Handle Repeatable Logic (Reset bar if needed)
    if (actionDef.stopOnRepeat) {
      runState.actionProgress[id].complete = false;
      runState.actionProgress[id].progress = 0;
    }

    // 3. Execute Post-Completion Rewards/Effects
    if (actionDef.postComplete) {
      const todo = Array.isArray(actionDef.postComplete)
        ? actionDef.postComplete
        : [actionDef.postComplete];

      for (const effect of todo) {
        // We update 'fake' entirely because effects might modify Global or Run state
        fake = deepClone(effect(fake));
      }
    }
  }

  function handleRetraceAll(newId: string | null = null) {
    fake = deepClone(get(gameState));
    fake.data.run = deepClone(EMPTY_RUN);

    if (newId) {
      retraceRecording.push({ id: newId });
    }

    for (const record of retraceRecording) {
      simulateAction(record.id);
    }

    retraceRecording = retraceRecording;
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
      <div class="bg-slate-500 w-full text-center text-slate-900 py-2">
        Retracing
      </div>
      <div class="flex-1 grid grid-cols-12 min-h-0">
        <div class="col-span-3 border-r-slate-500 border-r-2 overflow-y-auto">
          <div
            class="px-2 py-1 text-center bg-slate-500 text-slate-900 border-t-2 border-t-slate-900"
          >
            Timeline
          </div>
          <div class="pt-2 px-2">
            {#each bundledRetracedNodes.reverse() as record, idx}
              <div
                class="grid grid-cols-5 pixel-corners bg-slate-900 mb-2 p-1 border-b border-slate-700 text-sm"
              >
                <div class="col-span-4">
                  {actions[record.id].title}
                  {#if record.count > 1}
                    x{record.count}
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
          class="col-span-9 p-2 grid grid-cols-12 grid-rows-12 space-x-1 overflow-auto"
        >
          {#each displayableActions as node}
            <div class="col-span-2">
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
        class="grid grid-cols-12 w-full text-center border-t-slate-500 border-t-2"
      >
        <Button
          on:click={() => {
            $gameState.data.global.retraceConfig = retraceRecording.map((r) => {
              return { id: r.id };
            });
          }}
          config={{ classMixins: ["mx-2 my-2"] }}>save</Button
        >
        <Button
          on:click={() => {
            $gameState.data.global.retraceConfig = [];
            retraceRecording = [];
            handleRetraceAll(null);
          }}
          config={{ classMixins: ["mx-2 my-2"] }}>clear</Button
        >
        <Button
          config={{ classMixins: ["mx-2 my-2"] }}
          on:click={() => (isRetracing = false)}>exit</Button
        >
      </div>
    {/if}
  </div>
</div>
