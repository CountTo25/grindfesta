<script lang="ts">
  import { gameState } from "../state";
  import type { Action } from "../types";
  import ProgressBar from "./ProgressBar.svelte";
  import SkillIcon from "./SkillIcon.svelte";
  export let action: Action;
  export let id: string;
  export let running: boolean = false;
  export let config: { classes: string[] } = { classes: [] };
  export let progress = 0;
  $: console.log(progress);
  $: console.log(action.weight);
  $: percent = (progress / action.weight) * 100;
  $: console.log(percent);
  const toggleAction = () => {
    console.log("are we togglin yet?");
    if (!running) {
      $gameState.data.run.action = { id };
    } else {
      $gameState.data.run.action = null;
    }
    console.log($gameState.data.run.action);
  };
</script>

<div
  class="grid grid-cols-12 px-3 py-1 pixel-corners bg-slate-900 {config.classes.join(
    ' '
  )}"
>
  <div class="col-span-2 text-center text-sm text-slate-500">skill</div>
  <div class="col-span-6 text-sm text-slate-500">job name</div>
  <div class="col-span-4 text-sm text-slate-500 text-center">eta: 2s</div>
  <!-- -->
  <div class="col-span-2 text-center">
    <SkillIcon skill={action.skill} />
  </div>
  <div class="col-span-6">{action.title}</div>
  <div class="col-span-2 text-center cursor-pointer" on:click={toggleAction}>
    <i class="hn hn-{running ? 'pause' : 'play'}"></i>
  </div>
  <div class="col-span-2 text-center">Q</div>
  <div class="col-span-12 text-center"><ProgressBar {percent} /></div>
</div>
