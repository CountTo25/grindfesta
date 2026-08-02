<script lang="ts">
  import { gameState } from "../state";
  export let action: Action;
  import type { Action } from "../types";
  import { resolveActionText } from "../utils";
  $: title = resolveActionText(action.title, $gameState);
</script>

<button
  type="button"
  class="glass_card interactive_glass grid w-full grid-cols-12 px-3 py-2 text-left"
  on:click
>
  <div class="muted_text col-span-12 text-xs">{title}</div>
</button>
