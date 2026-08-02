<script lang="ts">
  import {
    gameState,
    bakedSkills,
    actionEndSignal,
    canStartAction,
    enqueueRunAction,
    playRunAction,
    queuedActionCountsById,
    stopRunAction,
  } from "../state";
  import type { Action } from "../types";
  import { resolveActionText } from "../utils";
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  export let action: Action;
  export let id: string;
  export let running: boolean = false;
  export let className = "";
  $: progress = $gameState.data.run.actionProgress[id]?.progress ?? 0;
  $: percent = (progress / action.weight) * 100;
  $: isRevealed =
    action.revealCondition?.every((condition) => condition($gameState)) ?? true;
  $: canToggle = isRevealed && canStartAction($gameState, id);
  $: isKnown = $gameState.data.global.completedActionHistory.includes(id);
  $: displayTitle = resolveActionText(action.title, $gameState);
  $: displayFlavourText = resolveActionText(action.flavourText, $gameState);
  $: duration =
    action.weight / ($bakedSkills.modifiers.total[action.skill] || 1);

  $: actionIcon = running
    ? "pause"
    : canToggle
      ? "play"
      : "exclamation-triangle";
  $: queuedCount = $queuedActionCountsById[id] ?? 0;

  const toggleAction = () => {
    if (!canToggle) return;
    if (!running) {
      playRunAction(id);
      return;
    }

    stopRunAction();
  };

  const queueAction = (singleRun: boolean) => {
    if (!canToggle) return;
    enqueueRunAction(id, singleRun);
  };
</script>

<div class="glass_card grid grid-cols-12 {className}">
  <div class="grid grid-cols-12 col-span-12 items-center px-3 pt-1">
    <div class="col-span-1 flex items-center justify-center">
      <GenericIcon icon={action.skill} />
    </div>
    <div class="col-span-7" class:muted_text={!isRevealed}>
      {isRevealed ? displayTitle : isKnown ? displayTitle : "???"}
    </div>
    <button
      type="button"
      class="glass_icon_button queue_action_button col-span-1 justify-self-center"
      aria-label={action.repeatable
        ? `Queue ${displayTitle} to maximum; right-click or Shift-click to queue once`
        : `Queue ${displayTitle}`}
      aria-pressed={queuedCount > 0}
      title={action.repeatable
        ? "Queue to maximum · right-click or Shift-click for one repetition"
        : "Queue action"}
      disabled={!canToggle}
      data-active={queuedCount > 0}
      on:click={(event) => queueAction(event.shiftKey)}
      on:contextmenu|preventDefault={() => queueAction(true)}
    >
      <GenericIcon icon="list-plus" />
      {#if queuedCount > 0}
        <span class="queue_action_count">{queuedCount}</span>
      {/if}
    </button>
    <button
      type="button"
      class="glass_icon_button col-span-1 justify-self-center"
      aria-label={running ? `Pause ${displayTitle}` : `Start ${displayTitle}`}
      disabled={!canToggle}
      on:click={toggleAction}
    >
      <GenericIcon icon={actionIcon} />
    </button>
    <div class="col-span-2 flex items-center justify-center whitespace-nowrap text-xs">
      <span class="muted_text">{duration.toFixed(2)}s</span>
    </div>
  </div>
  {#if !isRevealed}
    {#each action.revealConditionExplained ?? [] as condition}
      <div class="muted_text text-xs col-span-12 pl-2">
        {resolveActionText(condition, $gameState)}
      </div>
    {/each}
  {:else if displayFlavourText}
    <div class="muted_text text-xs col-span-12 -mt-1 pl-2">
      {displayFlavourText}
    </div>
  {/if}
  <div class="glass_content_clip_bottom col-span-12 text-center">
    {#key $actionEndSignal}
      <ProgressBar percent={isRevealed ? percent : 0} />
    {/key}
  </div>
</div>

<style>
  .queue_action_button {
    position: relative;
  }

  .queue_action_count {
    position: absolute;
    top: -2px;
    right: -1px;
    display: grid;
    min-width: 13px;
    height: 13px;
    place-items: center;
    padding: 0 3px;
    border-radius: 999px;
    background: rgb(var(--ui_accent) / 88%);
    color: var(--ui_on_accent);
    font-size: 9px;
    font-weight: 800;
    line-height: 1;
    box-shadow: 0 0 8px rgb(var(--ui_accent) / 42%);
  }
</style>
