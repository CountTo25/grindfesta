<script lang="ts">
  import type { Action, GameState } from "../types";
  import { resolveActionText } from "../utils";
  import GenericIcon from "./GenericIcon.svelte";

  export let action: Action;
  export let state: GameState;
  export let estimate: { durationMs: number; energyDrain: number };
  export let locked = false;
  export let repeatControls = false;
  export let onSelect: () => void;
  export let onSelectMax: () => void;

  $: title = resolveActionText(action.title, state);
  $: unavailableReasons = locked
    ? (action.revealCondition ?? []).flatMap((condition, index) =>
        condition(state)
          ? []
          : [
              resolveActionText(
                action.revealConditionExplained?.[index],
                state,
              ) || "Requirements not met",
            ],
      )
    : [];

  function handleRepeatCardClick(event: MouseEvent) {
    if (locked || (event.target as Element).closest("button")) return;
    onSelect();
  }
</script>

{#if repeatControls}
  <!-- The explicit controls provide keyboard access; the card shell is a pointer shortcut. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="glass_card retracing_action retracing_action_repeatable w-full px-3 py-2 text-left"
    class:interactive_glass={!locked}
    class:retracing_action_locked={locked}
    on:click={handleRepeatCardClick}
  >
    <div class="retracing_action_details">
      <div class="muted_text truncate text-xs">{title}</div>
      {#if locked}
        <div class="action_unavailable text-xs">
          {unavailableReasons.join(" · ") || "Requirements not met"}
        </div>
      {/if}
      <div class="action_estimate subtle_text">
        <span class="action_skill" role="img" aria-label={`${action.skill} skill`}>
          <GenericIcon icon={action.skill} size={10} />
        </span>
        <span aria-label={`Estimated duration ${(estimate.durationMs / 1000).toFixed(2)} seconds`}>
          <GenericIcon icon="clock" size={10} />
          {(estimate.durationMs / 1000).toFixed(2)}s
        </span>
        <span aria-label={`Estimated energy drain ${estimate.energyDrain.toFixed(2)}`}>
          <GenericIcon icon="bolt" size={10} />
          −{estimate.energyDrain.toFixed(2)}
        </span>
      </div>
    </div>
    <div class="retracing_action_controls">
      <button
        type="button"
        class="glass_icon_button retracing_mode_button"
        title="Add one repetition"
        aria-label={`Add one ${title}`}
        disabled={locked}
        on:click={onSelect}
      >
        <GenericIcon icon="plus" size={12} />
      </button>
      <button
        type="button"
        class="glass_icon_button retracing_mode_button"
        title="Repeat to maximum"
        aria-label={`Repeat ${title} to maximum`}
        disabled={locked}
        on:click={onSelectMax}
      >
        <GenericIcon icon="arrows-up-to-line" size={12} />
      </button>
    </div>
  </div>
{:else}
  <button
    type="button"
    class="glass_card interactive_glass retracing_action w-full px-3 py-2 text-left"
    disabled={locked}
    on:click={onSelect}
  >
    <div class="muted_text truncate text-xs">{title}</div>
    {#if locked}
      <div class="action_unavailable text-xs">
        {unavailableReasons.join(" · ") || "Requirements not met"}
      </div>
    {/if}
    <div class="action_estimate subtle_text">
      <span class="action_skill" role="img" aria-label={`${action.skill} skill`}>
        <GenericIcon icon={action.skill} size={10} />
      </span>
      <span aria-label={`Estimated duration ${(estimate.durationMs / 1000).toFixed(2)} seconds`}>
        <GenericIcon icon="clock" size={10} />
        {(estimate.durationMs / 1000).toFixed(2)}s
      </span>
      <span aria-label={`Estimated energy drain ${estimate.energyDrain.toFixed(2)}`}>
        <GenericIcon icon="bolt" size={10} />
        −{estimate.energyDrain.toFixed(2)}
      </span>
    </div>
  </button>
{/if}

<style>
  .retracing_action {
    display: grid;
    gap: 3px;
  }

  .retracing_action:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  .retracing_action_repeatable {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .retracing_action_locked {
    cursor: not-allowed;
    opacity: 0.58;
  }

  .retracing_action_details {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .retracing_action_controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .retracing_mode_button {
    border: 1px solid transparent;
    border-radius: 9px;
    background: rgb(255 255 255 / 5%);
  }

  .retracing_mode_button:hover:not(:disabled),
  .retracing_mode_button:focus-visible {
    border-color: rgb(var(--ui_accent) / 38%);
    background: rgb(var(--ui_accent) / 14%);
  }

  .action_unavailable {
    color: rgb(252 211 77 / 88%);
    line-height: 1rem;
    overflow-wrap: anywhere;
  }

  .action_estimate {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--ui_font_numeric);
    font-size: 0.66rem;
    font-variant-numeric: tabular-nums;
  }

  .action_estimate span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
</style>
