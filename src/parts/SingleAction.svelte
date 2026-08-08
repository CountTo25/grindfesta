<script lang="ts">
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
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
  import type { Action, GameState } from "../types";
  import { getSubLocationDisplayName, resolveActionText } from "../utils";
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  type ActionTrait = {
    icon: string;
    label: string;
  };

  const ACTION_HOVER_DELAY_MS = 500;

  export let action: Action;
  export let id: string;
  export let running: boolean = false;
  export let className = "";
  let cardElement: HTMLDivElement;
  let isHovered = false;
  let hoverTimer: number | null = null;
  let hoverLeft = 0;
  let hoverTop = 0;
  let hoverWidth = 0;
  let hoverHeight = 0;
  let popupAbove = false;
  $: progress = $gameState.data.run.actionProgress[id]?.progress ?? 0;
  $: percent = (progress / action.weight) * 100;
  $: isRevealed =
    action.revealCondition?.every((condition) => condition($gameState)) ?? true;
  $: isAvailable =
    action.availabilityCondition?.every((condition) =>
      condition($gameState),
    ) ?? true;
  $: canStart = isRevealed && canStartAction($gameState, id);
  $: canToggle = running || canStart;
  $: isKnown = $gameState.data.global.completedActionHistory.includes(id);
  $: displayTitle = resolveActionText(action.title, $gameState);
  $: displayFlavourText = resolveActionText(action.flavourText, $gameState);
  $: duration =
    action.weight / ($bakedSkills.modifiers.total[action.skill] || 1);
  $: remainingDuration =
    Math.max(action.weight - progress, 0) /
    ($bakedSkills.modifiers.total[action.skill] || 1);
  $: runSkillModifier = $bakedSkills.modifiers.run[action.skill] || 1;
  $: compressedSkillModifier =
    $bakedSkills.modifiers.global[action.skill] || 1;
  $: skillModifier = $bakedSkills.modifiers.total[action.skill] || 1;
  $: popupTitle = isRevealed
    ? displayTitle
    : isKnown
      ? displayTitle
      : "Unknown action";

  $: actionIcon = running
    ? "pause"
    : canToggle
      ? "play"
      : "exclamation-triangle";
  $: queuedCount = $queuedActionCountsById[id] ?? 0;
  $: actionTraits = getActionTraits(action, $gameState, isRevealed);

  function getActionTraits(
    action: Action,
    state: GameState,
    revealDestination: boolean,
  ): ActionTrait[] {
    const completionEffects = Array.isArray(action.postComplete)
      ? action.postComplete
      : [action.postComplete];
    const traits: ActionTrait[] = [];
    const movement = completionEffects.find(
      (effect) => effect.metadata?.kind === "moveSubLocation",
    );

    if (movement?.metadata?.kind === "moveSubLocation") {
      const destination = revealDestination
        ? getSubLocationDisplayName(
            state,
            state.data.run.location,
            movement.metadata.destination,
          )
        : null;
      traits.push({
        icon: "arrow-right-from-bracket",
        label: destination ? `Moves to ${destination}` : "Changes location",
      });
    }

    if (action.repeatable && !movement) {
      traits.push({
        icon: "repeat",
        label: "Repeatable until it becomes unavailable",
      });
    }

    if (!action.repeatable && action.crossGeneration) {
      traits.push({
        icon: "book-bookmark",
        label: "Completion persists across runs",
      });
    }

    return traits.slice(0, 3);
  }

  function portal(node: HTMLElement) {
    const host = document.querySelector(".app_shell") ?? document.body;
    host.appendChild(node);
    return {
      destroy: () => node.remove(),
    };
  }

  function clearHoverTimer() {
    if (hoverTimer === null) return;
    window.clearTimeout(hoverTimer);
    hoverTimer = null;
  }

  function activateActionDetails() {
    const bounds = cardElement.getBoundingClientRect();
    hoverLeft = bounds.left;
    hoverTop = bounds.top;
    hoverWidth = bounds.width;
    hoverHeight = bounds.height;
    popupAbove =
      window.innerHeight - bounds.bottom < 180 && bounds.top > 180;
    isHovered = true;
  }

  function showActionDetails() {
    if (isHovered || hoverTimer !== null) return;
    hoverTimer = window.setTimeout(() => {
      hoverTimer = null;
      activateActionDetails();
    }, ACTION_HOVER_DELAY_MS);
  }

  function hideActionDetails() {
    clearHoverTimer();
    isHovered = false;
  }

  function resumeActionDetails(event: MouseEvent) {
    if (
      event.relatedTarget instanceof Node &&
      cardElement.contains(event.relatedTarget)
    ) {
      showActionDetails();
    }
  }

  onDestroy(clearHoverTimer);

  const toggleAction = () => {
    if (!canToggle) return;
    if (!running) {
      playRunAction(id);
      return;
    }

    stopRunAction();
  };

  const queueAction = (singleRun: boolean) => {
    if (!canStart) return;
    enqueueRunAction(id, singleRun);
  };
</script>

<div
  bind:this={cardElement}
  class="action_hover_group relative {className}"
  class:z-30={isHovered}
  on:mouseenter={showActionDetails}
  on:mouseleave={hideActionDetails}
>
  <div
    class="glass_card action_card grid grid-cols-12"
    class:action_details_active={isHovered}
  >
    <div class="action_header col-span-12 grid items-center px-3 pt-1">
      <div class="flex items-center justify-center">
        <GenericIcon icon={action.skill} />
      </div>
      <div class="min-w-0" class:muted_text={!isRevealed}>
        {isRevealed ? displayTitle : isKnown ? displayTitle : "???"}
      </div>
      <button
        type="button"
        class="glass_icon_button queue_action_button justify-self-center"
        aria-pressed={queuedCount > 0}
        title={action.repeatable
          ? "Queue to maximum · right-click or Shift-click for one repetition"
          : "Queue action"}
        disabled={!canStart}
        data-active={queuedCount > 0}
        on:mouseenter={hideActionDetails}
        on:mouseleave={resumeActionDetails}
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
        class="glass_icon_button justify-self-center"
        disabled={!canToggle}
        on:mouseenter={hideActionDetails}
        on:mouseleave={resumeActionDetails}
        on:click={toggleAction}
      >
        <GenericIcon icon={actionIcon} />
      </button>
      <div class="action_duration flex items-center whitespace-nowrap text-xs">
        <span class="muted_text">{remainingDuration.toFixed(2)}s</span>
      </div>
      <div class="action_traits" aria-label="Action traits">
        {#each actionTraits as trait}
          <span
            class="action_trait_icon"
            role="img"
            aria-label={trait.label}
          >
            <GenericIcon icon={trait.icon} size={9} />
          </span>
        {/each}
      </div>
    </div>
    {#if !isRevealed}
      {#each action.revealConditionExplained ?? [] as condition}
        <div class="muted_text text-xs col-span-12 pl-2">
          {resolveActionText(condition, $gameState)}
        </div>
      {/each}
    {:else if !isAvailable}
      {#each action.availabilityConditionExplained ?? [] as condition}
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
</div>

{#if isHovered}
  <div
    use:portal
    class="action_hover_veil fixed inset-0 z-10 pointer-events-none"
    in:fade={{ duration: 140 }}
    out:fade={{ duration: 20 }}
    aria-hidden="true"
  >
    <div
      class="hover_veil action_veil_top"
      style={`height: ${hoverTop}px`}
    ></div>
    <div
      class="hover_veil action_veil_bottom"
      style={`top: ${hoverTop + hoverHeight}px`}
    ></div>
    <div
      class="hover_veil action_veil_left"
      style={`top: ${hoverTop}px; width: ${hoverLeft}px; height: ${hoverHeight}px`}
    ></div>
    <div
      class="hover_veil action_veil_right"
      style={`top: ${hoverTop}px; left: ${hoverLeft + hoverWidth}px; height: ${hoverHeight}px`}
    ></div>
  </div>

  <div
    use:portal
    class="glass_menu action_details_popup fixed z-40 p-3 pointer-events-none"
    class:popup_above={popupAbove}
    style={`left: ${hoverLeft}px; top: ${popupAbove ? hoverTop - 4 : hoverTop + hoverHeight + 4}px; width: ${hoverWidth}px`}
    role="tooltip"
    in:fade={{ duration: 120 }}
    out:fade={{ duration: 20 }}
  >
    <div class="action_popup_header">
      <span>{popupTitle}</span>
      <span class="muted_text capitalize">{action.skill}</span>
    </div>
    <div class="action_modifier_breakdown text-xs">
      <div class="action_modifier_row muted_text">
        <span>Current run</span>
        <span>x{runSkillModifier.toFixed(2)}</span>
      </div>
      <div class="action_modifier_row muted_text">
        <span>Time compression</span>
        <span>x{compressedSkillModifier.toFixed(2)}</span>
      </div>
      <div class="action_modifier_row action_modifier_total">
        <span>Total modifier</span>
        <span>
          x{runSkillModifier.toFixed(2)} × x{compressedSkillModifier.toFixed(
            2,
          )} = x{skillModifier.toFixed(2)}
        </span>
      </div>
    </div>
    <div class="muted_text text-xs action_duration_formula">
      {action.weight.toFixed(2)}s base ÷ x{skillModifier.toFixed(
        2,
      )} = {duration.toFixed(2)}s
    </div>
    <div class="muted_text text-xs">
      {progress.toFixed(2)} / {action.weight.toFixed(2)} progress
    </div>
    {#if queuedCount > 0}
      <div class="muted_text text-xs">
        Queued {queuedCount} {queuedCount === 1 ? "time" : "times"}
      </div>
    {/if}
    {#if actionTraits.length > 0}
      <div class="action_popup_traits">
        {#each actionTraits as trait}
          <div class="action_popup_trait text-xs">
            <span class="action_popup_trait_icon">
              <GenericIcon icon={trait.icon} size={11} />
            </span>
            <span>{trait.label}</span>
          </div>
        {/each}
      </div>
    {/if}
    <div class="action_popup_id">ID:#{id}</div>
  </div>
{/if}

<style>
  .action_header {
    grid-template-columns: 2rem minmax(0, 1fr) 2rem 2rem max-content 0.75rem;
    column-gap: 0.25rem;
    min-height: 2rem;
  }

  .action_duration {
    margin-left: 0.125rem;
    font-family: var(--ui_font_numeric);
    font-variant-numeric: tabular-nums;
  }

  .action_traits {
    display: grid;
    width: 0.75rem;
    max-height: 2rem;
    align-content: center;
    justify-items: center;
    gap: 1px;
  }

  .action_trait_icon {
    display: inline-flex;
    color: var(--ui_text_subtle);
    transition:
      color 500ms ease,
      filter 500ms ease;
  }

  .action_details_active .action_trait_icon {
    color: rgb(var(--ui_accent));
    filter:
      drop-shadow(0 0 2px rgb(var(--ui_accent) / 72%))
      drop-shadow(0 0 7px rgb(var(--ui_accent) / 38%));
  }

  .action_hover_veil > div {
    position: fixed;
    pointer-events: none;
  }

  .action_veil_top {
    inset: 0 0 auto;
  }

  .action_veil_bottom {
    right: 0;
    bottom: 0;
    left: 0;
  }

  .action_veil_left {
    left: 0;
  }

  .action_veil_right {
    right: 0;
  }

  .action_details_popup {
    --ui_surface: rgb(13 18 16 / 98%);
    --ui_surface_strong: rgb(7 9 8 / 99%);
    --ui_filter: blur(18px) saturate(1.18) brightness(0.94);
    max-height: min(260px, calc(100vh - 16px));
    overflow: hidden;
  }

  .action_details_popup.popup_above {
    transform: translateY(-100%);
  }

  .action_popup_header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.125rem;
  }

  .action_popup_traits {
    display: grid;
    gap: 0.25rem;
    margin-top: 0.625rem;
  }

  .action_modifier_breakdown {
    display: grid;
    gap: 0.1875rem;
    margin-top: 0.5rem;
  }

  .action_modifier_row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .action_modifier_total {
    margin-top: 0.125rem;
    padding-top: 0.3125rem;
    border-top: 1px solid var(--ui_stroke);
  }

  .action_duration_formula {
    margin-top: 0.375rem;
    font-variant-numeric: tabular-nums;
  }

  .action_popup_trait {
    display: grid;
    grid-template-columns: 1rem minmax(0, 1fr);
    align-items: center;
    gap: 0.375rem;
    color: var(--ui_text_muted);
  }

  .action_popup_trait_icon {
    display: inline-flex;
    justify-content: center;
    color: rgb(var(--ui_accent));
  }

  .action_popup_id {
    margin-top: 0.625rem;
    color: var(--ui_text_subtle);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.625rem;
    overflow-wrap: anywhere;
  }

  @media (prefers-reduced-motion: reduce) {
    .action_trait_icon {
      transition: none;
    }
  }

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
