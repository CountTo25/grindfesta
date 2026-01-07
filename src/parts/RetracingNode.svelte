<script lang="ts">
  import { gameState } from "../state";
  export let action: Action;
  export let id: string;
  export let retracing_id: string;
  import type { Action, GameState } from "../types";
  import GenericIcon from "./GenericIcon.svelte";
  $: title =
    typeof action.title === "string" ? action.title : action.title($gameState);
</script>

<div
  class="pixel-corners bg-slate-900 grid grid-cols-12 px-2 py-1 hover:bg-slate-600 transition-all cursor-pointer"
  on:click
>
  <div class="col-span-12 text-slate-300 text-xs">{title}</div>
  <div class="col-span-6"></div>
  <div class="col-span-6 text-sm text-slate-500"></div>
</div>
