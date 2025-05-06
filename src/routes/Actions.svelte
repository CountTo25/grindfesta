<script>
  import SingleAction from "../parts/SingleAction.svelte";
  import { displayableActions } from "../state";
  import { actions } from "../statics";
  $: allActions = $displayableActions
    .map((id) => actions[id] ?? null)
    .filter(Boolean);
</script>

<div class="px-1 py-1 grid grid-cols-12">
  <div class="col-span-6">
    {#each $displayableActions
      .map((id) => actions[id] ?? null)
      .filter(Boolean) as action}
      <SingleAction {action} config={{ classes: ["col-span-12"] }} />
    {/each}
  </div>
</div>
