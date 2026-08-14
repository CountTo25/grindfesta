<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import { BASE_TPS, canStartAction, simulateActionProgress } from "../state";
  import { actions } from "../statics";
  import type { GameState } from "../types";
  import { deepClone, getActionMovementDestination } from "../utils";
  import CompactSkillLevels from "./CompactSkillLevels.svelte";
  import RetracingNode from "./RetracingNode.svelte";

  export let state: GameState;
  export let actionIds: string[];
  export let warning: string | null = null;
  export let onSelect: (id: string) => void;
  export let onSelectMax: (id: string) => void;

  const ESTIMATE_TICK_MS = 1000 / BASE_TPS;
  const ESTIMATE_TICK_BUDGET = 1_000_000;
  const ESTIMATE_ENERGY_RESERVE = 1_000_000;

  function estimateAction(source: GameState, id: string) {
    const estimateState = deepClone(source);
    estimateState.data.run.currentEnergy = ESTIMATE_ENERGY_RESERVE;
    const result = simulateActionProgress(
      estimateState,
      id,
      ESTIMATE_TICK_MS,
      { remaining: ESTIMATE_TICK_BUDGET },
      true,
    );

    return {
      durationMs: result.elapsedMs,
      energyDrain: Math.max(
        0,
        ESTIMATE_ENERGY_RESERVE - result.state.data.run.currentEnergy,
      ),
    };
  }

  $: movementActionIds = actionIds.filter(
    (id) => getActionMovementDestination(actions[id]) !== null,
  );
  $: usualActionIds = actionIds.filter(
    (id) => getActionMovementDestination(actions[id]) === null,
  );
  $: actionEstimates = Object.fromEntries(
    actionIds.map((id) => [id, estimateAction(state, id)]),
  );
</script>

<section class="action_picker glass_divider_right col-span-5 min-h-0 sm:col-span-6">
  <CompactSkillLevels {state} />
  {#if warning}
    <div class="action_warning border-b border-amber-300/30 text-sm text-amber-300">
      {warning}
    </div>
  {/if}
  {#if actionIds.length === 0}
    <div class="subtle_text py-2 text-sm">
      No valid known actions from this simulated point
    </div>
  {:else}
    <div class="action_columns">
      <section class="action_column" aria-labelledby="usual-actions-heading">
        <h2 id="usual-actions-heading" class="action_heading">Actions</h2>
        <ScrollFade
          frameClass="min-h-0 flex-1"
          scrollerClass="glass_scroll h-full overflow-y-auto pr-1"
        >
          <div class="grid gap-2">
            {#each usualActionIds as id (id)}
              <RetracingNode
                action={actions[id]}
                {state}
                estimate={actionEstimates[id]}
                locked={!canStartAction(state, id)}
                repeatControls={actions[id].repeatable}
                onSelect={() => onSelect(id)}
                onSelectMax={() => onSelectMax(id)}
              />
            {/each}
            {#if usualActionIds.length === 0}
              <div class="subtle_text text-xs">No actions</div>
            {/if}
          </div>
        </ScrollFade>
      </section>
      <section class="action_column movement_column" aria-labelledby="movement-actions-heading">
        <h2 id="movement-actions-heading" class="action_heading">Movement</h2>
        <ScrollFade
          frameClass="min-h-0 flex-1"
          scrollerClass="glass_scroll h-full overflow-y-auto px-1"
        >
          <div class="grid gap-2">
            {#each movementActionIds as id (id)}
              <RetracingNode
                action={actions[id]}
                {state}
                estimate={actionEstimates[id]}
                locked={!canStartAction(state, id)}
                onSelect={() => onSelect(id)}
                onSelectMax={() => onSelectMax(id)}
              />
            {/each}
            {#if movementActionIds.length === 0}
              <div class="subtle_text text-xs">No movement actions</div>
            {/if}
          </div>
        </ScrollFade>
      </section>
    </div>
  {/if}
</section>

<style>
  .action_picker {
    display: flex;
    flex-direction: column;
    padding: 0 0.25rem 0 0.75rem;
  }

  .action_warning {
    margin: 0 0 0.25rem;
    padding: 0.25rem 0 0.5rem;
  }

  .action_columns {
    display: grid;
    min-height: 0;
    flex: 1;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 0.5rem;
  }

  .action_column {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
  }

  .movement_column {
    border-left: 1px solid var(--ui_stroke);
    padding-left: 0.5rem;
  }

  .action_heading {
    flex: 0 0 auto;
    margin: 0;
    padding: 0.25rem 0 0.4rem;
    color: var(--ui_text_muted);
    font-size: var(--ui_font_size_detail);
    font-weight: 600;
  }
</style>
