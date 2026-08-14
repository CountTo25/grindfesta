<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import type { RetraceAction } from "../types";
  import type { AdjacentBundle } from "../utils";
  import GenericIcon from "./GenericIcon.svelte";

  export let records: AdjacentBundle<RetraceAction>[];
  export let getTitle: (id: string) => string;
  export let onRemoveOne: () => void;
  export let onRemoveBundle: (count: number) => void;
</script>

<ScrollFade
  frameClass="glass_divider_right col-span-4 min-h-0 sm:col-span-3"
  scrollerClass="glass_scroll h-full overflow-y-auto"
>
  <div class="glass_kicker px-3 pb-2">Timeline</div>
  <div class="px-2">
    {#if records.length === 0}
      <div class="subtle_text px-1 py-2 text-xs">No retrace steps yet</div>
    {/if}
    {#each records as record, idx (`${record.id}-${record.startIndex}`)}
      {@const title = getTitle(record.id)}
      <div class="glass_card timeline_card mb-2 p-2 text-sm">
        <div class="min-w-0">
          <div class="truncate">{title}</div>
          {#if record.count > 1}
            <div class="subtle_text text-xs">x{record.count}</div>
          {/if}
        </div>
        {#if idx === 0}
          <div class="timeline_controls">
            {#if record.count > 1}
              <button
                type="button"
                class="glass_icon_button timeline_action_button timeline_remove_one"
                title="Remove one action"
                aria-label={`Remove one ${title}`}
                on:click={onRemoveOne}
              >
                <span aria-hidden="true">−</span>
              </button>
            {/if}
            <button
              type="button"
              class="glass_icon_button timeline_action_button"
              title={record.count > 1 ? "Remove action bundle" : "Remove action"}
              aria-label={record.count > 1
                ? `Remove all ${record.count} ${title} actions`
                : `Remove ${title}`}
              on:click={() => onRemoveBundle(record.count)}
            >
              <GenericIcon icon="trash" />
            </button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</ScrollFade>

<style>
  .timeline_card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 4px;
  }

  .timeline_controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .timeline_action_button {
    border: 1px solid transparent;
    border-radius: 9px;
    background: rgb(255 255 255 / 5%);
  }

  .timeline_action_button:hover,
  .timeline_action_button:focus-visible {
    border-color: rgb(var(--ui_accent) / 38%);
    background: rgb(var(--ui_accent) / 14%);
  }

  .timeline_remove_one {
    font-family: var(--ui_font_numeric);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1;
  }
</style>
