<script lang="ts">
  export let testId: string | null = null;

  const DEFAULT_CONFIG = {
    classMixins: [] as string[],
    disabled: false,
    loading: false,
  };
  export let config: Partial<typeof DEFAULT_CONFIG> = DEFAULT_CONFIG;
  $: usedConfig = { ...DEFAULT_CONFIG, ...config };
  const maybeDisabledClasses = (disabled: boolean) => {
    return disabled
      ? [
          "bg-slate-900",
          "transition-none",
          "hover:bg-slate-900",
          "cursor-not-allowed",
        ]
      : [];
  };

  $: console.log(usedConfig.disabled);
  $: mixins = [
    ...usedConfig.classMixins,
    ...maybeDisabledClasses(usedConfig.disabled || usedConfig.loading),
  ].join(" ");
</script>

<button
  on:click
  class="px-4 py-2 border-4 rounded-md hover:bg-slate-700 transition-all bg-slate-600 border-slate-700 {mixins}"
  data-testid={testId}
>
  {#if usedConfig.loading}
    ...
  {:else}
    <slot />
  {/if}
</button>
