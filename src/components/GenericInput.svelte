<script lang="ts">
  export let testId: string | null = null;
  const DEFAULT_CONFIG = {
    label: null as string | null,
    placeholder: null as string | null,
    type: "text",
  };
  export let config: Partial<typeof DEFAULT_CONFIG> = DEFAULT_CONFIG;
  export let value: string | null = null;
  const usedConfig = { ...DEFAULT_CONFIG, ...config };
</script>

<div class="relative">
  <div class="grid grid-cols-2 mb-1">
    {#if usedConfig.label}
      <div class="text-slate-300 col-span-2">
        {usedConfig.label}
      </div>
    {/if}
  </div>
  <input
    bind:value
    on:change
    type={usedConfig.type}
    placeholder={usedConfig.placeholder}
    class="bg-slate-700 w-full px-3 py-1"
    data-testid={testId}
  />
</div>
