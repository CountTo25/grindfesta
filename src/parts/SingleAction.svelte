<script lang="ts">
  import type { Action } from "../types";
  import ProgressBar from "./ProgressBar.svelte";
  export let action: Action;
  export let config: { classes: string[] } = { classes: [] };
  let percent = 0;
  setInterval(() => {
    percent++;
    if (percent > 100) percent = 0;
  }, 100);
</script>

<div
  class="grid grid-cols-12 px-3 py-1 border border-slate-600 {config.classes.join(
    ' '
  )}"
>
  <div class="col-span-2 text-center text-sm text-slate-500">skill</div>
  <div class="col-span-6 text-sm text-slate-500">job name</div>
  <div class="col-span-4 text-sm text-slate-500 text-center">eta: 2s</div>
  <!-- -->
  <div class="col-span-2"></div>
  <div class="col-span-6">{action.title}</div>
  <div class="col-span-2 text-center">+</div>
  <div class="col-span-2 text-center">Q</div>
  <div class="col-span-12 text-center"><ProgressBar {percent} /></div>
</div>
