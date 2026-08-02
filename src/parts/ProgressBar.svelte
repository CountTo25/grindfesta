<script lang="ts">
  type ProgressTone = "run" | "time_compression" | "simulated_energy";

  export let percent = 0;
  export let tone: ProgressTone = "run";

  $: clampedPercent = Math.max(0, Math.min(100, percent));
</script>

<div
  class="glass_progress"
  role="progressbar"
  aria-label="Progress"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={Math.round(clampedPercent)}
>
  <div
    class="glass_progress_fill"
    class:time_compression={tone === "time_compression"}
    class:simulated_energy={tone === "simulated_energy"}
    style={`width: ${clampedPercent}%`}
  ></div>
</div>

<style>
  .glass_progress {
    width: 100%;
    height: 6px;
    overflow: hidden;
    border-top: 1px solid rgb(255 255 255 / 7%);
    background: rgb(0 0 0 / 30%);
    box-shadow: inset 0 1px 3px rgb(0 0 0 / 40%);
  }

  .glass_progress_fill {
    --progress-rgb: var(--ui_accent);
    height: 100%;
    background:
      linear-gradient(90deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 18%)),
      rgb(var(--progress-rgb) / 76%);
    box-shadow:
      0 0 12px rgb(var(--progress-rgb) / 45%),
      inset 0 1px 0 rgb(255 255 255 / 34%);
    transition: width 180ms ease-out;
  }

  .glass_progress_fill.time_compression {
    --progress-rgb: var(--ui_progress_time_compression);
  }

  .glass_progress_fill.simulated_energy {
    --progress-rgb: var(--ui_progress_simulated_energy);
  }

  @media (prefers-reduced-motion: reduce) {
    .glass_progress_fill {
      transition: none;
    }
  }
</style>
