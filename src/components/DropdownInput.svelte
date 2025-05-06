<script lang="ts">
  import { fade } from "svelte/transition";

  const DEFAULT_CONFIG = {
    label: "Label",
    entries: [] as string[],
    popupLimit: 5,
  };
  export let config: Partial<typeof DEFAULT_CONFIG> = DEFAULT_CONFIG;
  export let value: string | null = "";
  export let testId: string | null = null;
  let inputValue: string | null = "";
  let isFocused = false;
  const usedConfig = { ...DEFAULT_CONFIG, ...config };

  const dropFocus = () => (isFocused = false);
  const startFocus = () => (isFocused = true);
  const setValue = (val: string) => () => {
    value = val;
    inputValue = val;
    dropFocus();
  };

  $: filteredEntries = usedConfig.entries.filter((e) =>
    e.startsWith(inputValue ?? "")
  );
  $: displayEntries = filteredEntries.slice(0, usedConfig.popupLimit);
  $: value === null && (inputValue = null);
</script>

<div class="relative z-50">
  <div class="grid grid-cols-2 mb-1">
    <div class="text-slate-400 col-span-1">{usedConfig.label}</div>
    {#if isFocused}
      <div class="text-slate-400 col-span-1 text-right">
        {filteredEntries.length}/{usedConfig.entries.length}
      </div>
    {/if}
  </div>

  <input
    on:focus={startFocus}
    bind:value={inputValue}
    class="bg-slate-700 w-full px-3 py-1"
    type="text"
    data-testid={testId ? `${testId}_input` : null}
  />
  {#if isFocused}
    <div class="absolute mt-2 w-full">
      {#each displayEntries as entry}
        <div
          class="mt-1 px-3 py-1 bg-slate-600 w-full cursor-pointer hover:bg-slate-700 transition-all"
          on:click={setValue(entry)}
          data-testid={testId ? `${testId}_entry_${entry}` : null}
        >
          {entry}
        </div>
      {/each}
    </div>
  {/if}
</div>
{#if isFocused}
  <div
    in:fade={{ duration: 150 }}
    on:click={dropFocus}
    class="z-40 backdrop-blur absolute w-full h-full top-0 left-0 transition-all"
    data-testid={testId ? `${testId}_backdrop` : null}
  >
    <!-- blur all else -->
  </div>
{/if}
