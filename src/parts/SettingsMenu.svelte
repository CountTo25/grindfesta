<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import {
    gameState,
    simulationTimeScale,
    type SimulationTimeScale,
  } from "../state";
  import {
    getItemCapacity,
    items,
    type ItemKey,
  } from "../gameData/items";
  import { COMPLETION_EFFECTS } from "../utils";
  import {
    glassReflectionsEnabled,
    setGlassReflectionsEnabled,
  } from "../system/glassGlow";
  import GenericIcon from "./GenericIcon.svelte";

  type SettingsAction = "export" | "import";
  type DeveloperRoute = "game" | "iconGen";

  export let iconGenOpen = false;

  const dispatch = createEventDispatcher<{
    select: SettingsAction;
    navigate: DeveloperRoute;
  }>();
  const isLocalhost = window.location.hostname === "localhost";
  const simulationTimeScales: SimulationTimeScale[] = [1, 10, 100];
  const itemOptions = Object.entries(items).map(([id, item]) => ({
    id: id as ItemKey,
    name: String(item.name),
  }));
  let open = false;
  let itemQuery = "";
  let itemSuggestionsOpen = false;
  let highlightedItemIndex = 0;

  $: selectedItem = itemOptions.find(({ id, name }) => {
    const normalizedQuery = itemQuery.trim().toLocaleLowerCase();
    return (
      id.toLocaleLowerCase() === normalizedQuery ||
      name.toLocaleLowerCase() === normalizedQuery
    );
  });
  $: filteredItemOptions = itemOptions.filter(({ id, name }) => {
    const normalizedQuery = itemQuery.trim().toLocaleLowerCase();
    return (
      normalizedQuery.length === 0 ||
      id.toLocaleLowerCase().includes(normalizedQuery) ||
      name.toLocaleLowerCase().includes(normalizedQuery)
    );
  });
  $: selectedItemCapacity = selectedItem
    ? getItemCapacity(selectedItem.id, $gameState)
    : null;
  $: selectedItemAmount = selectedItem
    ? ($gameState.data.run.inventory[selectedItem.id]?.amount ?? 0)
    : 0;
  $: itemCanBeAdded = Boolean(
    selectedItem &&
      (selectedItemCapacity === null ||
        selectedItemAmount < selectedItemCapacity),
  );

  function select(action: SettingsAction) {
    open = false;
    dispatch("select", action);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") open = false;
  }

  function sudoku() {
    open = false;
    window.__dev.sudoku();
  }

  function navigate(route: DeveloperRoute) {
    open = false;
    dispatch("navigate", route);
  }

  function addItem() {
    if (!selectedItem || !itemCanBeAdded) return;
    gameState.update(COMPLETION_EFFECTS.addItem(selectedItem.id, 1));
  }

  function openItemSuggestions() {
    itemSuggestionsOpen = true;
    highlightedItemIndex = 0;
  }

  function selectItem(id: ItemKey) {
    itemQuery = id;
    itemSuggestionsOpen = false;
  }

  function handleItemPickerKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && itemSuggestionsOpen) {
      event.preventDefault();
      event.stopPropagation();
      itemSuggestionsOpen = false;
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      if (!itemSuggestionsOpen) {
        openItemSuggestions();
        return;
      }
      if (filteredItemOptions.length === 0) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      highlightedItemIndex =
        (highlightedItemIndex + direction + filteredItemOptions.length) %
        filteredItemOptions.length;
      return;
    }

    if (event.key === "Enter" && itemSuggestionsOpen) {
      const highlightedItem = filteredItemOptions[highlightedItemIndex];
      if (!highlightedItem) return;
      event.preventDefault();
      event.stopPropagation();
      selectItem(highlightedItem.id);
    }
  }
</script>

<svelte:window on:click={() => (open = false)} on:keydown={handleKeydown} />

<div class="settings_menu_root">
  {#if open}
    {#if isLocalhost && itemSuggestionsOpen}
      <div
        id="dev-item-suggestions"
        class="item_suggestions glass_menu"
        role="listbox"
        aria-label="Existing items"
        transition:fly={{ x: 6, duration: 120 }}
        on:click|stopPropagation
      >
        <div class="item_suggestions_header">
          <span>Items</span>
          <span>{filteredItemOptions.length}</span>
        </div>
        <div class="item_suggestions_list">
          {#each filteredItemOptions as { id, name }, index (id)}
            <button
              id={`dev-item-option-${id}`}
              type="button"
              class="item_suggestion"
              role="option"
              aria-selected={selectedItem?.id === id}
              data-highlighted={index === highlightedItemIndex || undefined}
              on:mousedown|preventDefault
              on:mouseenter={() => (highlightedItemIndex = index)}
              on:click={() => selectItem(id)}
            >
              <span class="item_suggestion_name">{name}</span>
              <span class="item_suggestion_id">{id}</span>
            </button>
          {:else}
            <div class="item_suggestions_empty">No matching items</div>
          {/each}
        </div>
      </div>
    {/if}
    <div
      id="settings-menu"
      class="settings_menu glass_menu"
      role="menu"
      transition:fly={{ y: 6, duration: 120 }}
    >
      <button type="button" role="menuitem" on:click={() => select("export")}>
        Export save
      </button>
      <button type="button" role="menuitem" on:click={() => select("import")}>
        Import save
      </button>
      <div class="dev_setting">
        <span class="dev_setting_label">Glass reflections</span>
        <div
          class="time_scale_options reflection_options"
          role="group"
          aria-label="Glass reflections"
        >
          <button
            type="button"
            class="time_scale_option"
            role="menuitemradio"
            aria-checked={$glassReflectionsEnabled}
            on:click|stopPropagation={() => setGlassReflectionsEnabled(true)}
          >
            ON
          </button>
          <button
            type="button"
            class="time_scale_option"
            role="menuitemradio"
            aria-checked={!$glassReflectionsEnabled}
            on:click|stopPropagation={() => setGlassReflectionsEnabled(false)}
          >
            OFF
          </button>
        </div>
      </div>
      {#if isLocalhost}
        <div class="dev_setting">
          <span class="dev_setting_label">Time scale</span>
          <div
            class="time_scale_options"
            role="group"
            aria-label="Simulation time scale"
          >
            {#each simulationTimeScales as scale}
              <button
                type="button"
                class="time_scale_option"
                role="menuitemradio"
                aria-checked={$simulationTimeScale === scale}
                on:click={() => simulationTimeScale.set(scale)}
              >
                {scale}&times;
              </button>
            {/each}
          </div>
        </div>
        <div class="dev_setting">
          <label class="dev_setting_label" for="dev-item-picker">
            Add item
          </label>
          <form
            class="add_item_controls"
            on:click|stopPropagation
            on:submit|preventDefault|stopPropagation={addItem}
          >
            <input
              id="dev-item-picker"
              type="text"
              placeholder="Item"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="dev-item-suggestions"
              aria-expanded={itemSuggestionsOpen}
              aria-activedescendant={itemSuggestionsOpen &&
              filteredItemOptions[highlightedItemIndex]
                ? `dev-item-option-${filteredItemOptions[highlightedItemIndex].id}`
                : undefined}
              bind:value={itemQuery}
              on:focus={openItemSuggestions}
              on:input={openItemSuggestions}
              on:keydown={handleItemPickerKeydown}
            />
            <button
              type="submit"
              class="add_item_button"
              aria-label="Add selected item to current run"
              title="Add item"
              disabled={!itemCanBeAdded}
            >
              <GenericIcon icon="plus" size={13} />
            </button>
          </form>
        </div>
        <button type="button" role="menuitem" on:click={sudoku}>
          Sudoku
        </button>
        <button
          type="button"
          role="menuitem"
          on:click={() => navigate(iconGenOpen ? "game" : "iconGen")}
        >
          {iconGenOpen ? "To game" : "Icon gen"}
        </button>
      {/if}
    </div>
  {/if}

  <button
    type="button"
    class="glass_icon_button settings_trigger"
    aria-controls="settings-menu"
    aria-expanded={open}
    data-active={open || undefined}
    on:click|stopPropagation={() => (open = !open)}
  >
    <GenericIcon icon="cog" />
  </button>
</div>

<style>
  .settings_menu_root {
    --settings_menu_width: 176px;
    position: relative;
    flex: 0 0 auto;
  }

  .settings_trigger {
    width: 34px;
    min-width: 34px;
    height: 34px;
  }

  .settings_menu {
    --ui_surface: rgb(17 23 20 / 96%);
    --ui_surface_strong: rgb(5 10 8 / 98%);
    --ui_filter: blur(18px) saturate(1.2) brightness(0.92);
    position: absolute;
    right: -1px;
    bottom: calc(100% + 10px);
    width: var(--settings_menu_width);
    padding: 7px;
    transform-origin: bottom right;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 20%),
      0 18px 40px rgb(0 0 0 / 44%);
  }

  .item_suggestions {
    --ui_surface: rgb(17 23 20 / 97%);
    --ui_surface_strong: rgb(5 10 8 / 99%);
    --ui_filter: blur(18px) saturate(1.2) brightness(0.92);
    position: absolute;
    right: calc(var(--settings_menu_width) + 7px);
    bottom: calc(100% + 10px);
    width: min(270px, calc(100vw - var(--settings_menu_width) - 28px));
    max-height: min(420px, calc(100vh - 32px));
    padding: 7px;
    transform-origin: bottom right;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 20%),
      0 18px 40px rgb(0 0 0 / 44%);
  }

  .item_suggestions_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 7px 8px;
    color: var(--ui_text_subtle);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .item_suggestions_list {
    max-height: min(370px, calc(100vh - 82px));
    overflow-y: auto;
    scrollbar-color: rgb(var(--ui_accent) / 35%) transparent;
    scrollbar-width: thin;
  }

  .item_suggestion {
    display: grid;
    width: 100%;
    min-width: 0;
    padding: 7px 9px;
    border: 1px solid transparent;
    border-radius: 9px;
    outline: none;
    background: transparent;
    color: var(--ui_text_muted);
    cursor: pointer;
    gap: 2px;
    text-align: left;
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      color 120ms ease;
  }

  .item_suggestion:hover,
  .item_suggestion:focus-visible,
  .item_suggestion[data-highlighted="true"] {
    border-color: rgb(var(--ui_accent) / 22%);
    background: rgb(var(--ui_accent) / 14%);
    color: var(--ui_text);
  }

  .item_suggestion[aria-selected="true"] {
    border-color: rgb(var(--ui_accent) / 42%);
    background: rgb(var(--ui_accent) / 20%);
  }

  .item_suggestion_name,
  .item_suggestion_id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item_suggestion_name {
    font-size: 0.78rem;
    font-weight: 750;
  }

  .item_suggestion_id {
    color: var(--ui_text_subtle);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      monospace;
    font-size: 0.66rem;
  }

  .item_suggestions_empty {
    padding: 16px 9px;
    color: var(--ui_text_subtle);
    font-size: 0.76rem;
    text-align: center;
  }

  .settings_menu button {
    display: block;
    width: 100%;
    min-height: 38px;
    padding: 8px 10px;
    border: 0;
    border-radius: 9px;
    outline: none;
    background: transparent;
    color: var(--ui_text_muted);
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 120ms ease,
      color 120ms ease;
  }

  .settings_menu button:hover,
  .settings_menu button:focus-visible {
    background: var(--ui_fill_hover);
    color: var(--ui_text);
  }

  .settings_menu button:focus-visible {
    box-shadow: inset 0 0 0 1px rgb(var(--ui_accent) / 42%);
  }

  .dev_setting {
    margin-top: 5px;
    padding: 9px 4px 7px;
    border-top: 1px solid rgb(255 255 255 / 9%);
  }

  .dev_setting_label {
    display: block;
    padding: 0 6px 7px;
    color: var(--ui_text_subtle);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .time_scale_options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  .reflection_options {
    grid-template-columns: repeat(2, 1fr);
  }

  .add_item_controls {
    display: grid;
    grid-template-columns: 4fr 1fr;
    gap: 4px;
  }

  .add_item_controls input {
    width: 100%;
    min-width: 0;
    min-height: 32px;
    padding: 5px 8px;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 9px;
    outline: none;
    background: rgb(255 255 255 / 3%);
    color: var(--ui_text);
    font-size: 0.78rem;
  }

  .add_item_controls input::placeholder {
    color: var(--ui_text_subtle);
  }

  .add_item_controls input:focus-visible {
    border-color: rgb(var(--ui_accent) / 48%);
    box-shadow: 0 0 0 1px rgb(var(--ui_accent) / 18%);
  }

  .settings_menu .add_item_button {
    display: grid;
    min-height: 32px;
    padding: 5px 4px;
    place-items: center;
    border: 1px solid rgb(255 255 255 / 8%);
    background: rgb(255 255 255 / 3%);
    text-align: center;
  }

  .settings_menu .add_item_button:disabled {
    background: rgb(255 255 255 / 2%);
    color: var(--ui_text_subtle);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .settings_menu .time_scale_option {
    min-height: 32px;
    padding: 5px 4px;
    border: 1px solid rgb(255 255 255 / 8%);
    background: rgb(255 255 255 / 3%);
    font-size: 0.78rem;
    text-align: center;
  }

  .settings_menu .time_scale_option[aria-checked="true"] {
    border-color: rgb(var(--ui_accent) / 48%);
    background: rgb(var(--ui_accent) / 22%);
    color: var(--ui_text);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 13%),
      0 0 12px rgb(var(--ui_accent) / 10%);
  }

  @media (prefers-reduced-motion: reduce) {
    .settings_menu button {
      transition: none;
    }
  }
</style>
