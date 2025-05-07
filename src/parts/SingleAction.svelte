<script lang="ts">
  import { gameState } from "../state";
  import type { Action } from "../types";
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import SkillIcon from "./SkillIcon.svelte";
  export let action: Action;
  export let id: string;
  export let running: boolean = false;
  export let config: { classes: string[] } = { classes: [] };
  export let progress = 0;
  $: percent = (progress / action.weight) * 100;
  const toggleAction = () => {
    if (!running) {
      $gameState.data.run.action = { id };
    } else {
      $gameState.data.run.action = null;
    }
  };
</script>

<div
  class="grid grid-cols-12 pixel-corners bg-slate-900 {config.classes.join(
    ' '
  )}"
>
  <div class="grid grid-cols-12 col-span-12 px-3 py-1">
    <div class="col-span-2 text-center">
      <SkillIcon skill={action.skill} />
    </div>
    <div class="col-span-5">{action.title}</div>
    <div class="col-span-1 text-center cursor-pointer" on:click={toggleAction}>
      <GenericIcon icon={running ? "pause" : "play"} />
    </div>
    <div class="col-span-1 text-center cursor-pointer">
      <GenericIcon icon={"login"} />
    </div>
    <div class="col-span-1 text-center cursor-pointer">
      <GenericIcon icon={"lock-alt"} />
    </div>
    <div class="col-span-2 text-center">
      <GenericIcon icon={"clock"} />
      <span class=" text-slate-500">2s</span>
    </div>
  </div>
  <div class="col-span-12 text-center"><ProgressBar {percent} /></div>
</div>
