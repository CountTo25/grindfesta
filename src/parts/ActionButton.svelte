<script lang="ts">
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  export let icon: string;
  export let testId: string | null = null;
  export let flavourText: string | null = null;
  export let progress = 0;
  export let decorative = false;
  export let accent: string | null = null;
</script>

<button
  type="button"
  on:click
  class="glass_card interactive_glass grid w-full grid-cols-12 text-left"
  class:decorative_action_button={decorative}
  disabled={decorative}
  aria-hidden={decorative || undefined}
  data-testid={testId}
  style={accent ? `--ui_accent: ${accent}` : undefined}
>
  <span class="col-span-12 grid grid-cols-12 px-3 pt-1">
    <span class="col-span-1 text-center">
      <GenericIcon {icon} />
    </span>
    <span class="col-span-10">
      <slot />
    </span>
    <span class="col-span-1 text-center">
      <GenericIcon icon="angle-right-solid" />
    </span>
  </span>
  {#if flavourText}
    <span class="muted_text col-span-12 pl-2 text-xs">
      {flavourText}
    </span>
  {/if}
  <span class="glass_content_clip_bottom col-span-12">
    <ProgressBar percent={progress} />
  </span>
</button>

<style>
  .decorative_action_button {
    --glass-edge-color: rgb(var(--ui_accent) / 46%);
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(var(--ui_accent) / 14%),
      rgb(var(--ui_accent) / 5%)
    );
    cursor: default;
  }
</style>
