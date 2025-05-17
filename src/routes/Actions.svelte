<script lang="ts">
  import type { ItemKey } from "../gameData/items";
  import { items } from "../gameData/items";
  import SingleAction from "../parts/SingleAction.svelte";
  import { displayableActions, gameState } from "../state";
  import { actions } from "../statics";
  $: allActions = $displayableActions
    .map((id) => (actions[id] && { action: actions[id], id }) ?? null)
    .filter(Boolean);

  $: allItems = Object.entries($gameState.data.run.inventory) as [
    ItemKey,
    { amount: Number; cooldown: number },
  ][];
</script>

<div class="grid grid-cols-12 gap-2">
  <div class="col-span-8">
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
            {$gameState.data.run.inventory[key]?.amount ?? 0}/{$gameState.data
              .run.inventoryCapacity}
          </div>
          <div class="grid grid-cols-2">
            <div class="text-slate-500 text-xs">{items[key].description}</div>
            <div class="text-slate-500 text-xs text-right">
              {value.cooldown.toFixed(2)}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
