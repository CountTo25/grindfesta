<script lang="ts">
  import { formatTime } from "../utils";

  export let time: number | null;
  export let previousTime: number | null = null;

  const MINIMUM_VISIBLE_DIFFERENCE_MS = 1000;

  $: difference =
    time !== null && previousTime !== null ? time - previousTime : null;
  $: visibleDifference =
    difference !== null &&
    Math.abs(difference) >= MINIMUM_VISIBLE_DIFFERENCE_MS
      ? difference
      : null;

  function formatDifference(value: number) {
    const sign = value < 0 ? "−" : value > 0 ? "+" : "±";
    return `${sign}${formatTime(Math.abs(value))}`;
  }

  function describeDifference(value: number) {
    if (value === 0) return "Same time as the previous run";
    return `${formatTime(Math.abs(value))} ${value < 0 ? "faster" : "slower"} than the previous run`;
  }
</script>

<div class="shrink-0 text-right">
  <div class="subtle_text text-xs">
    {time === null ? "known" : formatTime(time)}
  </div>
  {#if visibleDifference !== null}
    <div
      class="milestone_time_difference"
      class:milestone_time_faster={visibleDifference < 0}
      class:milestone_time_slower={visibleDifference > 0}
      title={describeDifference(visibleDifference)}
    >
      {formatDifference(visibleDifference)}
    </div>
  {/if}
</div>

<style>
  .milestone_time_difference {
    color: var(--ui_text_subtle);
    font-size: 0.625rem;
    line-height: 0.78rem;
  }

  .milestone_time_faster {
    color: #87b89d;
  }

  .milestone_time_slower {
    color: #bd8d86;
  }
</style>
