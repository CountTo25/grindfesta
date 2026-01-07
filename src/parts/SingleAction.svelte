<script lang="ts">
  import { get } from "svelte/store";
  import {
    gameState,
    bakery,
    bakeSignal,
    actionsCheckSignal,
    actionEndSignal,
  } from "../state";
  import type { Action, GameState } from "../types";
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import SkillIcon from "./SkillIcon.svelte";
  export let action: Action;
  export let id: string;
  export let running: boolean = false;
  export let config: { classes: string[] } = { classes: [] };
  $: progress = calcProgress($gameState, $actionEndSignal !== null);
  $: percent = (progress / action.weight) * 100;
  $: isRevealed = checkIsRevealed($actionsCheckSignal !== null);
  $: canToggle = checkCanToggle($gameState, isRevealed);
  $: isKnown = checkIsKnown($actionsCheckSignal !== null);
  $: duration =
    ($bakeSignal !== null &&
      action.weight / bakery.modifiers.total[action.skill]!) ||
    action.weight;

  $: actionIcon = running
    ? "pause"
    : canToggle && isRevealed
      ? "play"
      : "exclamation-triangle";

  function calcProgress(g: GameState, _: boolean): number {
    let progress = g.data.run.actionProgress[id]?.progress ?? 0;
    return progress;
  }

  function checkCanToggle(s: GameState, revealed: boolean): boolean {
    if (!revealed) {
      return false;
    }
    if (!action.grants) {
      return true;
    }
  }

  function checkIsRevealed(_: boolean): boolean {
    let s = get(gameState);
    if (!action.revealCondition) {
      return true;
    }
    if (!action.revealCondition.every((d) => d(s))) {
      return false;
    }
    return true;
  }
  function checkIsKnown(_: boolean): boolean {
    let s = get(gameState);
    return s.data.global.completedActionHistory.includes(id);
  }

  const toggleAction = () => {
    if (!canToggle) return;
    $gameState.data.run.retraceIdx = null;
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
  <div class="grid grid-cols-12 col-span-12 px-3 pt-1">
    <div class="col-span-1 text-center">
      <SkillIcon skill={action.skill} />
    </div>
    <div class="col-span-8" class:text-slate-300={!isRevealed}>
      {isRevealed ? action.title : isKnown ? action.title : "???"}
    </div>
    <div class="col-span-1 text-center cursor-pointer" on:click={toggleAction}>
      <GenericIcon icon={actionIcon} />
    </div>
    <div class="col-span-2 text-center">
      <GenericIcon icon={"clock"} />
      <span class=" text-slate-300">{duration.toFixed(2)}s</span>
    </div>
  </div>
  {#if !isRevealed}
    {#each action.revealConditionExplained ?? [] as condition}
      <div class="text-xs col-span-12 text-slate-300 pl-2">{condition}</div>
    {/each}
  {:else if action.flavourText}
    <div class="text-xs col-span-12 text-slate-300 pl-2">
      {action.flavourText}
    </div>
  {/if}
  <div class="col-span-12 text-center">
    {#key $actionEndSignal}
      <ProgressBar percent={isRevealed ? percent : 0} />
    {/key}
  </div>
</div>
