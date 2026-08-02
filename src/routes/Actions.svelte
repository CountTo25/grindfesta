<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import type { ItemKey } from "../gameData/items";
  import { items } from "../gameData/items";
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

    return queuedAction.mode === "max" ? "MAX" : "1×";
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
            <span class="section_header_meta">
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
              <button
                type="button"
                class="queue_card glass_card mb-1 grid w-full grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left text-xs"
                aria-label={`Remove ${queuedAction.count > 1 ? `all ${queuedAction.count} queued ` : ""}${getActionTitle($gameState, queuedAction.id)}${queuedAction.count > 1 ? " actions" : " from action queue"}`}
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
                <div
                  class="muted_text text-xs"
                  title={queuedAction.mode === "max"
                    ? "Repeat until the action can no longer run"
                    : "Run once"}
                >
                  {getQueueCountLabel(queuedAction)}
                </div>
              </button>
            {/each}
          </ScrollFade>
        </div>
      </div>
      <div class="col-span-3 h-full min-h-0 min-w-0">
        <div class="glass_surface flex h-full min-h-0 flex-col p-2">
          <h2 class="section_header">
            <span>Inventory</span>
            <span class="section_header_meta" aria-hidden="true"></span>
          </h2>
          <ScrollFade
            frameClass="min-h-0 flex-1"
            scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
          >
            {#each allItems as [key, value] (key)}
              <div>
                {items[key].name}
                {$gameState.data.run.inventory[key]?.amount ?? 0}/{items[
                  key
                ].capacity($gameState)}
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
                    percent={Math.floor((value.cooldown / 5000) * 100)}
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
  .section_header {
    display: grid;
    gap: 1px;
    margin: 0 -0.5rem 8px;
    padding: 0 0.75rem 7px;
    border-bottom: 1px solid var(--ui_stroke);
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .section_header_meta {
    min-height: 1rem;
    color: var(--ui_text_subtle);
    font-size: var(--ui_font_size_detail);
    font-weight: 400;
    line-height: 1rem;
    letter-spacing: 0;
  }

  .queue_card {
    cursor: pointer;
  }

  .queue_card:focus-visible {
    outline: 1px solid var(--ui_stroke_strong);
    outline-offset: -3px;
  }
</style>
