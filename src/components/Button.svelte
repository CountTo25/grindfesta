<script lang="ts">
  export let testId: string | null = null;
  export let active = false;
  export let accent: string | null = null;
  export let className = "";
  export let disabled = false;
</script>

<button
  type="button"
  on:click
  class="glass_control {className}"
  {disabled}
  data-active={active || undefined}
  data-testid={testId}
  style={accent ? `--ui_accent: ${accent}` : undefined}
>
  <slot />
</button>
