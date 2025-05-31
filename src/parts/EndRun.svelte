<script lang="ts">
  import { fade } from "svelte/transition";
  import { CONDITION_CHECKS, deepClone, formatTime } from "../utils";
  import Button from "../components/Button.svelte";
  import { endRun, gameState, ghostDisplayableActions } from "../state";
  import RetracingNode from "./RetracingNode.svelte";
  import { actions } from "../statics";
  import { EMPTY_RUN, type RunState } from "../types";
  import { get } from "svelte/store";
  let isRetracing = false;
  let knownNodes = $gameState.data.global.completedActionHistory;
  type RetracedRecord = {
    id: string;
    amount: number;
  };

  type GhostState = RunState;
  //lets make it simplier — we'll instantly "complete" actions to reveal whats next without affecting current state
  let retraceRecording: RetracedRecord[] = [];
  let state: GhostState = { ...EMPTY_RUN };
  $: displayableActions = ghostDisplayableActions(state).filter((v) => {
    return knownNodes.includes(v);
  });
  $: console.log(displayableActions, "?", state);
  function handleRetrace(id: string) {
    let fake = deepClone(get(gameState));
    if (!state.actionProgress[id]) {
      state.actionProgress[id] = {
        complete: true,
        progress: actions[id].weight,
      };
    } else {
      state.actionProgress[id].complete = true;
      state.actionProgress[id].progress = actions[id].weight;
    }
    if (actions[id].stopOnRepeat) {
      state.actionProgress[id].complete = false;
      state.actionProgress[id].progress = 0;
    }

    fake.data.run = deepClone(state);
    if (actions[id].postComplete) {
      let todo = [];
      if (!Array.isArray(actions[id].postComplete)) {
        todo = [actions[id].postComplete];
      } else {
        todo = actions[id].postComplete;
      }

      for (const action of todo) {
        console.log("running action of", id);
        let result = action(fake);
        console.log("patched", result.data.run);
        fake = deepClone(result);
      }
    }
    state = fake.data.run;
    retraceRecording.push({ id: id, amount: 1 });
    retraceRecording = retraceRecording;
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
            {#if $gameState.data.global.loop > 2}
              <Button
                config={{ classMixins: ["mx-2"] }}
                on:click={() => (isRetracing = true)}>Setup retracing</Button
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
        <div class="col-span-3 border-r-slate-500 border-r-2">
          <div
            class="px-2 py-1 text-center bg-slate-500 text-slate-900 border-t-2 border-t-slate-900"
          >
            Timeline
          </div>
          {#each retraceRecording as record}
            <div>{actions[record.id].title}</div>
          {/each}
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
                  handleRetrace(node);
                }}
              />
            </div>
          {/each}
        </div>
      </div>
      <div
        class="grid grid-cols-12 w-full text-center border-t-slate-500 border-t-2"
      >
        <Button config={{ classMixins: ["mx-2 my-2"] }}>save</Button>
        <Button
          config={{ classMixins: ["mx-2 my-2"] }}
          on:click={() => (isRetracing = false)}>exit</Button
        >
      </div>
    {/if}
  </div>
</div>
