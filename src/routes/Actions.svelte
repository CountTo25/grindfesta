<script>
  import SingleAction from "../parts/SingleAction.svelte";
  import { displayableActions, gameState } from "../state";
  import { actions } from "../statics";
  $: allActions = $displayableActions
    .map((id) => (actions[id] && { action: actions[id], id }) ?? null)
    .filter(Boolean);
</script>

<div class="grid grid-cols-12">
  <div class="col-span-6">
    {#each allActions as { action, id } (id)}
      <SingleAction
        {action}
        {id}
        running={$gameState.data.run.action?.id == id}
        config={{ classes: ["col-span-12 mb-2"] }}
        progress={$gameState.data.run.actionProgress[id]?.progress ?? 0}
      />
    {/each}
  </div>
</div>
