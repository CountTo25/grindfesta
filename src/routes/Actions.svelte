<script lang="ts">
  import type { ItemKey } from "../gameData/items";
  import { items } from "../gameData/items";
  import ProgressBar from "../parts/ProgressBar.svelte";
  import SingleAction from "../parts/SingleAction.svelte";
  import { displayableActions, gameState } from "../state";
  import { actions } from "../statics";
  $: allActions = $displayableActions
    .map((id) => (actions[id] && { action: actions[id], id }) ?? null)
    .filter(Boolean)
    .sort((l, r) => (r.action.idx ?? 0) - (l.action.idx ?? 0));

  $: allItems = Object.entries($gameState.data.run.inventory).filter(
    ([, { amount }]) => {
      return amount > 0;
    }
  ) as [ItemKey, { amount: Number; cooldown: number }][];
</script>

<div class="grid grid-cols-12 h-full gap-2">
  <div class="col-span-8 h-full overflow-y-auto">
    {#each allActions as { action, id } (id)}
      <SingleAction
        {action}
        {id}
        running={$gameState.data.run.action?.id == id}
        config={{ classes: ["col-span-12 mb-2"] }}
      />
    {/each}
  </div>
  <div class="col-span-4">
    {#if Object.entries($gameState.data.run.inventory).length > 0}
      <div class="pixel-corners p-2 bg-slate-900">
        {#each allItems as [key, value] (key)}
          <div>
            {items[key].name}
            {$gameState.data.run.inventory[key]?.amount ?? 0}/{items[
              key
            ].capacity($gameState)}
          </div>
          <div class="grid grid-cols-4">
            <div class="text-slate-500 text-xs col-span-3">
              {items[key].description}
            </div>
            {#if items[key].consumable}
              <div class="text-slate-500 text-xs text-right col-span-1">
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
      </div>
    {/if}
  </div>
</div>
