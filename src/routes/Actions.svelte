<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import {
    getItemCapacity,
    getItemCooldown,
    items,
    type ItemKey,
  } from "../gameData/items";
  import ProgressBar from "../parts/ProgressBar.svelte";
  import SingleAction from "../parts/SingleAction.svelte";
  import {
    displayableActions,
    gameState,
    liveActionQueue,
    queuedActionEstimateSeconds,
    removeRunActionFromQueue,
  } from "../state";
  import { actions } from "../statics";
  import type { GameState, QueuedAction } from "../types";
  import {
    bundleAdjacentBy,
    resolveActionText,
    type AdjacentBundle,
  } from "../utils";
  import Timeline from "./Timeline.svelte";

  type QueuedActionBundle = AdjacentBundle<QueuedAction>;

  function getActionTitle(state: GameState, id: string) {
    const title = actions[id]?.title;
    return title ? resolveActionText(title, state) : id;
  }

  function getQueueCountLabel(queuedAction: QueuedActionBundle) {
    if (queuedAction.count > 1) {
      return queuedAction.mode === "max"
        ? `${queuedAction.count}× MAX`
        : `${queuedAction.count}×`;
    }

    return queuedAction.mode === "max" ? "MAX" : null;
  }

  function getDisplayableActions(ids: string[]) {
    return ids
      .flatMap((id) => {
        const action = actions[id];
        return action ? [{ action, id }] : [];
      })
      .sort((left, right) =>
        (right.action.idx ?? 0) - (left.action.idx ?? 0),
      );
  }

  function getItemCountLabel(state: GameState, key: ItemKey) {
    const amount = state.data.run.inventory[key]?.amount ?? 0;
    const capacity = getItemCapacity(key, state);
    return capacity === null ? `${amount}` : `${amount}/${capacity}`;
  }

  $: allActions = getDisplayableActions($displayableActions);
  $: bundledLiveQueue = bundleAdjacentBy(
    $liveActionQueue,
    ({ id, mode, source }) => `${id}:${mode}:${source ?? "legacy"}`,
  );

  $: allItems = Object.entries($gameState.data.run.inventory).filter(
    ([, { amount }]) => {
      return amount > 0;
    }
  ) as [ItemKey, { amount: Number; cooldown: number }][];
</script>

<div class="grid h-full grid-cols-12 gap-1 overflow-hidden px-2 pb-2">
  <section class="col-span-9 h-full min-h-0 overflow-hidden">
    <div class="grid h-full grid-cols-12 gap-1">
      <ScrollFade
        frameClass="col-span-6 h-full min-w-0"
        scrollerClass="glass_scroll h-full min-w-0 overflow-y-auto"
      >
        {#each allActions as { action, id } (id)}
          <SingleAction
            {action}
            {id}
            running={$gameState.data.run.action?.id == id}
            className="col-span-12 mb-1"
          />
        {/each}
      </ScrollFade>
      <div class="col-span-3 h-full min-h-0 min-w-0">
        <div class="glass_surface flex h-full min-h-0 flex-col p-2">
          <h2 class="section_header">
            <span>Queue</span>
            <span class="section_header_meta queue_header_meta">
              {$liveActionQueue.length}
              {$liveActionQueue.length === 1 ? "item" : "items"} · ~{$queuedActionEstimateSeconds.toFixed(
                2,
              )}s
            </span>
          </h2>
          <ScrollFade
            frameClass="min-h-0 flex-1"
            scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto"
          >
            {#each bundledLiveQueue as queuedAction (`${queuedAction.id}-${queuedAction.mode}-${queuedAction.source ?? "legacy"}-${queuedAction.startIndex}`)}
              {@const countLabel = getQueueCountLabel(queuedAction)}
              <button
                type="button"
                class="queue_card glass_card mb-1 grid w-full grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left text-xs"
                title={queuedAction.count > 1
                  ? "Remove grouped actions from queue"
                  : "Remove from queue"}
                on:click={() =>
                  removeRunActionFromQueue(
                    queuedAction.startIndex,
                    queuedAction.count,
                  )}
              >
                <div class="min-w-0 truncate">
                  {getActionTitle($gameState, queuedAction.id)}
                </div>
                {#if countLabel}
                  <div
                    class="muted_text text-xs"
                    title={queuedAction.mode === "max"
                      ? "Repeat until the action can no longer run"
                      : "Queued multiple times"}
                  >
                    {countLabel}
                  </div>
                {/if}
              </button>
            {/each}
          </ScrollFade>
        </div>
      </div>
      <div class="col-span-3 h-full min-h-0 min-w-0">
        <div class="glass_surface flex h-full min-h-0 flex-col p-2">
          <h2 class="section_header">
            <span>Inventory</span>
          </h2>
          <ScrollFade
            frameClass="min-h-0 flex-1"
            scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
          >
            {#each allItems as [key, value] (key)}
              <div>
                {items[key].name}
                {getItemCountLabel($gameState, key)}
              </div>
              <div class="grid grid-cols-4">
                <div class="muted_text text-xs col-span-3">
                  {items[key].description}
                </div>
                {#if items[key].consumable}
                  <div class="muted_text text-xs text-right col-span-1">
                    {(value.cooldown / 1000).toFixed(2)}s
                  </div>
                {/if}
                <div class="col-span-2">
                  <ProgressBar
                    percent={Math.floor(
                      (value.cooldown / getItemCooldown(key)) * 100,
                    )}
                  />
                </div>
              </div>
            {/each}
          </ScrollFade>
        </div>
      </div>
    </div>
  </section>

  <Timeline />
</div>

<style>
  .queue_header_meta {
    font-family: var(--ui_font_numeric);
    font-variant-numeric: tabular-nums;
  }

  .queue_card {
    cursor: pointer;
  }

  .queue_card:focus-visible {
    outline: 1px solid var(--ui_stroke_strong);
    outline-offset: -3px;
  }
</style>
