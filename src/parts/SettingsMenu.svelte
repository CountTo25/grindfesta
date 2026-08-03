<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import GenericIcon from "./GenericIcon.svelte";

  type SettingsAction = "export" | "import";
  type DeveloperRoute = "game" | "iconGen";

  export let iconGenOpen = false;

  const dispatch = createEventDispatcher<{
    select: SettingsAction;
    navigate: DeveloperRoute;
  }>();
  const isLocalhost = window.location.hostname === "localhost";
  let open = false;

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
</script>

<svelte:window on:click={() => (open = false)} on:keydown={handleKeydown} />

<div class="settings_menu_root">
  {#if open}
    <div
      id="settings-menu"
      class="settings_menu glass_menu"
      role="menu"
      aria-label="Settings"
      transition:fly={{ y: 6, duration: 120 }}
    >
      <button type="button" role="menuitem" on:click={() => select("export")}>
        Export save
      </button>
      <button type="button" role="menuitem" on:click={() => select("import")}>
        Import save
      </button>
      {#if isLocalhost}
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
    aria-label={open ? "Close settings" : "Open settings"}
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
    width: 176px;
    padding: 7px;
    transform-origin: bottom right;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 20%),
      0 18px 40px rgb(0 0 0 / 44%);
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

  @media (prefers-reduced-motion: reduce) {
    .settings_menu button {
      transition: none;
    }
  }
</style>
