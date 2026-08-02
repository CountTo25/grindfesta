<script lang="ts">
  import GenericIcon from "./GenericIcon.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  export let icon: string;
  export let testId: string | null = null;
  export let flavourText: string | null = null;
</script>

<button
  type="button"
  on:click
  class="glass_card interactive_glass grid w-full grid-cols-12 text-left"
  data-testid={testId}
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
    <ProgressBar percent={0} />
  </span>
</button>
