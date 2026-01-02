<script lang="ts">
  import { fade } from "svelte/transition";
  import { deepClone, formatTime } from "../utils";
  import Button from "../components/Button.svelte";
  import { endRun, gameState, ghostDisplayableActions } from "../state";
  import RetracingNode from "./RetracingNode.svelte";
  import { actions } from "../statics";
  import { EMPTY_RUN, GameState } from "../types";
  import { get } from "svelte/store";

  let isRetracing = false;
  let knownNodes = $gameState.data.global.completedActionHistory;

  type RetracedRecord = {
    id: string;
  };

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
  <div class="w-full h-full pixel-corners bg-slate-900 relative flex flex-col">
    {#if !isRetracing}
      <div class="py-2 px-3">
        <div class="grid grid-cols-12">
          <div class="col-span-12 text-lg text-center">
            Energy ran out after {formatTime($endRun!.timeSpent)}
          </div>
          <div class="col-span-12 text-center">
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

            <Button
              config={{ classMixins: ["mx-2"] }}
              on:click={() => ($endRun = null)}>Unwind time</Button
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
            {#each [...[...retraceRecording].entries()].reverse() as [idx, record]}
              <div
                class="grid grid-cols-5 pixel-corners bg-slate-900 mb-2 p-1 border-b border-slate-700 text-sm"
              >
                <div class="col-span-4">
                  {actions[record.id].title}
                </div>
                {#if idx === retraceRecording.length - 1}
                  <div class="col-span-1">
                    <div
                      class="text-center cursor-pointer"
                      on:click={() => {
                        retraceRecording.splice(idx, 1);
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
