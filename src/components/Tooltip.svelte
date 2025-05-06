<script lang="ts">
  import GenericLine from "./GenericLine.svelte";

  export let config: { label: string; classes?: string[] } = { label: "" };
  let show = false;

  const toggle = () => (show = !show);
  const hide = () => (show = false);
</script>

<div
  class="tooltip-container"
  on:click|stopPropagation={toggle}
  on:touchstart|stopPropagation={toggle}
  on:blur={hide}
>
  <GenericLine {config}><slot /></GenericLine>
  <div class="tooltip-text {show ? 'show' : ''} bg-slate-900 px-2 py-1">
    {config.label}
  </div>
</div>

<!-- Optional: close tooltip when clicking outside -->
<svelte:window on:click={hide} />

<style>
  .tooltip-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .tooltip-text {
    position: absolute;
    z-index: 1;
    bottom: 90%;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  .tooltip-container:hover .tooltip-text {
    opacity: 1;
    pointer-events: auto;
  }

  .tooltip-text.show {
    opacity: 1;
    pointer-events: auto;
  }
</style>
