<script lang="ts">
  import { onMount, tick } from "svelte";
  import { get } from "svelte/store";
  import Button from "../components/Button.svelte";
  import ScrollFade from "../components/ScrollFade.svelte";
  import { getLocationAccent } from "../gameData/locationAccents";
  import { items } from "../gameData/items";
  import GenericIcon from "../parts/GenericIcon.svelte";
  import ProgressBar from "../parts/ProgressBar.svelte";
  import RetracingActionPicker from "../parts/RetracingActionPicker.svelte";
  import RetracingTimeline from "../parts/RetracingTimeline.svelte";
  import {
    bakeStateSnapshot,
    BASE_TPS,
    canSkipUnavailableRetraceAction,
    canStartAction,
    completeSimulatedAction,
    endRun,
    gameState,
    getActiveRetraceConfig,
    ghostDisplayableActions,
    prepareFreshRun,
    simulateActionProgress,
  } from "../state";
  import { actions } from "../statics";
  import {
    applyAnchorLeap,
    createRetraceLeapId,
    getAnchorInventoryItems,
    getRetraceLeapItemId,
    isCurrentEraAnchor,
  } from "../system/leap";
  import {
    GameState,
    type Item,
    type RetraceAction,
    type RetraceConfig,
  } from "../types";
  import {
    bundleAdjacentBy,
    deepClone,
    formatTime,
    getAnchorDestinationDisplayName,
    resolveActionText,
  } from "../utils";

  const RETRACE_TICK_MS = 1000 / BASE_TPS;
  const MAX_RETRACE_SIM_TICKS = 1_000_000;

  const initialConfig = getActiveRetraceConfig(get(gameState));
  let knownNodes = $gameState.data.global.completedActionHistory;
  let retraceWarning: string | null = null;
  let selectedConfigId: string | null = initialConfig?.id ?? null;
  let editingConfigId: string | null = null;
  let retraceName = initialConfig?.name ?? "";
  let retraceNameInput: HTMLInputElement | null = null;
  let retraceRecording: RetraceAction[] = deepClone(
    initialConfig?.actions ?? [],
  );
  let fake: GameState = buildFakeState();

  $: displayableActions = ghostDisplayableActions(fake).filter(
    (v) => knownNodes.includes(v),
  );
  $: availableRetraceLeaps = getAnchorInventoryItems(fake).filter(
    (anchorItem) => !isCurrentEraAnchor(fake, anchorItem),
  );
  $: fakeEnergyPercent = Math.max(
    0,
    Math.min(100, (fake.data.run.currentEnergy / fake.data.run.maxEnergy) * 100),
  );
  $: bundledRetracedNodes = bundleAdjacentBy(
    retraceRecording,
    ({ id }) => id,
  );
  $: reversedBundledRetracedNodes = bundledRetracedNodes.slice().reverse();

  onMount(() => handleRetraceAll());

  function buildFakeState() {
    const next = deepClone(get(gameState));
    return bakeStateSnapshot(prepareFreshRun(next));
  }

  function actionTitle(id: string) {
    const leapItemId = getRetraceLeapItemId(id);
    if (leapItemId) {
      const anchor = (items[leapItemId] as Item | undefined)?.anchor;
      return anchor
        ? `Leap to ${getAnchorDestinationDisplayName(fake, anchor.location, anchor.sublocation)}`
        : "Unavailable leap";
    }
    return resolveActionText(actions[id].title, fake);
  }

  function simulateAction(id: string) {
    const leapItemId = getRetraceLeapItemId(id);
    if (leapItemId) {
      const anchorItem = getAnchorInventoryItems(fake).find(
        (candidate) => candidate.itemId === leapItemId,
      );
      if (!anchorItem || isCurrentEraAnchor(fake, anchorItem)) {
        retraceWarning =
          "Retrace stopped: planned leap is no longer available.";
        return false;
      }

      fake = bakeStateSnapshot(applyAnchorLeap(fake, anchorItem));
      return true;
    }

    if (!actions[id] || !canStartAction(fake, id)) {
      if (canSkipUnavailableRetraceAction(fake, id)) {
        return true;
      }
      retraceWarning = "Retrace stopped: planned action is no longer available.";
      return false;
    }

    const tickBudget = { remaining: MAX_RETRACE_SIM_TICKS };
    const result = simulateActionProgress(
      fake,
      id,
      RETRACE_TICK_MS,
      tickBudget,
      true,
    );
    fake = result.state;
    if (!result.completed) {
      retraceWarning =
        fake.data.run.currentEnergy <= 0
          ? "Retrace stopped: energy would run out here."
          : "Retrace stopped: simulation took too long.";
      return false;
    }

    fake = completeSimulatedAction(fake, id);
    return true;
  }

  function handleRetraceAll(newId: string | null = null) {
    fake = buildFakeState();
    retraceWarning = null;

    const records = [...retraceRecording];
    if (newId) {
      records.push({ id: newId });
    }

    const nextRecording: RetraceAction[] = [];
    for (const record of records) {
      const before = deepClone(fake);
      if (!simulateAction(record.id)) {
        fake = before;
        break;
      }
      nextRecording.push(record);
    }

    retraceRecording = nextRecording;
    fake = fake;
  }

  function handleRetraceMax(id: string) {
    handleRetraceAll();
    const nextRecording = [...retraceRecording];

    while (canStartAction(fake, id)) {
      const before = deepClone(fake);
      if (!simulateAction(id)) {
        fake = before;
        retraceWarning = null;
        break;
      }
      nextRecording.push({ id });
    }

    retraceRecording = nextRecording;
    fake = fake;
  }

  function saveRetracing() {
    const name = retraceName.trim();
    if (!name) return;

    const actions = retraceRecording.map(({ id }) => ({ id }));
    let savedConfigId = selectedConfigId;

    gameState.update((state) => {
      const configs = [...state.data.global.retraceConfigs];
      const selectedIndex = configs.findIndex(
        ({ id }) => id === selectedConfigId,
      );

      if (selectedIndex >= 0) {
        configs[selectedIndex] = {
          ...configs[selectedIndex],
          name,
          actions,
        };
        savedConfigId = configs[selectedIndex].id;
      } else {
        savedConfigId = createRetraceConfigId(configs);
        configs.push({ id: savedConfigId, name, actions });
      }

      state.data.global.retraceConfigs = configs;
      state.data.global.activeRetraceConfigId = savedConfigId;
      return state;
    });

    selectedConfigId = savedConfigId;
    retraceName = name;
    if ($endRun) $endRun.mainViewRoute = "endRun";
  }

  function clearRetracing() {
    retraceRecording = [];
    if (selectedConfigId) {
      gameState.update((state) => {
        state.data.global.retraceConfigs = state.data.global.retraceConfigs.map(
          (config) =>
            config.id === selectedConfigId
              ? { ...config, actions: [] }
              : config,
        );
        return state;
      });
    }
    handleRetraceAll();
  }

  function removeLatestRetraceActions(count: number) {
    retraceRecording = retraceRecording.slice(
      0,
      Math.max(0, retraceRecording.length - count),
    );
    handleRetraceAll();
  }

  function createRetraceConfigId(configs: RetraceConfig[]) {
    let id: string;
    do {
      id = globalThis.crypto?.randomUUID?.() ??
        `retrace-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } while (configs.some((config) => config.id === id));
    return id;
  }

  function loadRetraceConfig(config: RetraceConfig) {
    selectedConfigId = config.id;
    editingConfigId = null;
    retraceName = config.name;
    retraceRecording = deepClone(config.actions);
    handleRetraceAll();
  }

  function selectRetraceConfig(id: string) {
    const config = $gameState.data.global.retraceConfigs.find(
      (candidate) => candidate.id === id,
    );
    if (!config) return;

    gameState.update((state) => {
      state.data.global.activeRetraceConfigId = config.id;
      return state;
    });
    loadRetraceConfig(config);
  }

  async function startNewRetraceConfig() {
    const configs = get(gameState).data.global.retraceConfigs;
    const newConfig: RetraceConfig = {
      id: createRetraceConfigId(configs),
      name: createRetraceConfigName(configs),
      actions: [],
    };

    gameState.update((state) => {
      state.data.global.retraceConfigs = [
        ...state.data.global.retraceConfigs,
        newConfig,
      ];
      state.data.global.activeRetraceConfigId = newConfig.id;
      return state;
    });

    loadRetraceConfig(newConfig);
    editingConfigId = newConfig.id;
    await focusRetraceNameInput();
  }

  function createRetraceConfigName(configs: RetraceConfig[]) {
    const names = new Set(configs.map(({ name }) => name));
    let number = configs.length + 1;
    while (names.has(`Plan ${number}`)) number++;
    return `Plan ${number}`;
  }

  async function editRetraceConfigName(config: RetraceConfig) {
    if (config.id !== selectedConfigId) selectRetraceConfig(config.id);
    editingConfigId = config.id;
    retraceName = config.name;
    await focusRetraceNameInput();
  }

  function saveRetraceConfigName(config: RetraceConfig) {
    const name = retraceName.trim();
    if (!name) return;

    gameState.update((state) => {
      state.data.global.retraceConfigs = state.data.global.retraceConfigs.map(
        (candidate) =>
          candidate.id === config.id ? { ...candidate, name } : candidate,
      );
      return state;
    });
    retraceName = name;
    editingConfigId = null;
  }

  function cancelRetraceConfigName(config: RetraceConfig) {
    retraceName = config.name;
    editingConfigId = null;
  }

  function handleRetraceNameKeydown(
    event: KeyboardEvent,
    config: RetraceConfig,
  ) {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      saveRetraceConfigName(config);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelRetraceConfigName(config);
    }
  }

  function handleRetraceConfigKeydown(event: KeyboardEvent, id: string) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectRetraceConfig(id);
  }

  async function focusRetraceNameInput() {
    await tick();
    retraceNameInput?.focus();
    retraceNameInput?.select();
  }

  function deleteRetraceConfig(configId: string) {
    if (!configId) return;

    let nextConfig: RetraceConfig | null = null;
    gameState.update((state) => {
      const deletedIndex = state.data.global.retraceConfigs.findIndex(
        ({ id }) => id === configId,
      );
      if (deletedIndex < 0) return state;

      const configs = state.data.global.retraceConfigs.filter(
        ({ id }) => id !== configId,
      );
      nextConfig = configs[Math.min(deletedIndex, configs.length - 1)] ?? null;
      state.data.global.retraceConfigs = configs;
      state.data.global.activeRetraceConfigId = nextConfig?.id ?? null;
      return state;
    });

    if (nextConfig) loadRetraceConfig(nextConfig);
    else {
      selectedConfigId = null;
      editingConfigId = null;
      retraceName = "";
      retraceRecording = [];
      handleRetraceAll();
    }
  }
</script>

<div
  class="h-full min-h-0 grid grid-rows-[auto_1fr_auto] overflow-hidden px-2"
  data-testid="retracing-view"
>
  <div
    class="glass_surface grid grid-cols-12 gap-x-3 gap-y-2 px-4 py-3"
  >
    <div class="retrace_config_row col-span-12" aria-label="Retracing plans">
      {#each $gameState.data.global.retraceConfigs as config (config.id)}
        <div
          class="retrace_config_button"
          class:retrace_config_button_active={config.id === selectedConfigId}
          role="button"
          tabindex="0"
          aria-pressed={config.id === selectedConfigId}
          data-testid={`retrace-config-${config.id}`}
          on:click={() => selectRetraceConfig(config.id)}
          on:keydown={(event) =>
            handleRetraceConfigKeydown(event, config.id)}
        >
          {#if editingConfigId === config.id}
            <button
              type="button"
              class="retrace_config_delete"
              data-testid="delete-retrace-config"
              aria-label={`Delete ${config.name}`}
              on:click={(event) => {
                event.stopPropagation();
                deleteRetraceConfig(config.id);
              }}
            >
              <GenericIcon icon="trash" />
            </button>
            <input
              class="retrace_config_name_input"
              data-testid="retrace-config-name"
              bind:this={retraceNameInput}
              bind:value={retraceName}
              maxlength="48"
              aria-label="Plan name"
              on:click={(event) => event.stopPropagation()}
              on:keydown={(event) =>
                handleRetraceNameKeydown(event, config)}
            />
          {:else}
            <span class="retrace_config_name" title={config.name}>
              {config.name}
            </span>
          {/if}
          <button
            type="button"
            class="retrace_config_edit"
            aria-label={editingConfigId === config.id
              ? `Save ${config.name} name`
              : `Edit ${config.name} name`}
            disabled={editingConfigId === config.id && !retraceName.trim()}
            on:click={(event) => {
              event.stopPropagation();
              if (editingConfigId === config.id) {
                saveRetraceConfigName(config);
              } else {
                editRetraceConfigName(config);
              }
            }}
          >
            <GenericIcon
              icon={editingConfigId === config.id ? "save" : "edit"}
            />
          </button>
        </div>
      {/each}
      <button
        type="button"
        class="retrace_config_add"
        data-testid="new-retrace-config"
        aria-label="Add retracing plan"
        on:click={startNewRetraceConfig}
      >
        <GenericIcon icon="plus" />
      </button>
    </div>
    <div class="muted_text col-span-6 text-xs sm:col-span-2">
      Planned time
      <div class="primary_text">{formatTime(fake.data.run.timeSpent)}</div>
    </div>
    <div class="muted_text col-span-6 text-xs sm:col-span-2">
      Steps
      <div class="primary_text">{retraceRecording.length}</div>
    </div>
    <div class="muted_text col-span-12 text-xs sm:col-span-8">
      Simulated energy
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <ProgressBar percent={fakeEnergyPercent} tone="simulated_energy" />
        </div>
        <div class="primary_text min-w-28 text-right text-sm">
          {fake.data.run.currentEnergy.toFixed(2)} / {fake.data.run.maxEnergy.toFixed(2)}
        </div>
      </div>
    </div>
  </div>

  <div class="min-h-0 grid grid-cols-12 overflow-hidden pt-2">
    <RetracingTimeline
      records={reversedBundledRetracedNodes}
      getTitle={actionTitle}
      onRemoveOne={() => removeLatestRetraceActions(1)}
      onRemoveBundle={removeLatestRetraceActions}
    />

    <RetracingActionPicker
      state={fake}
      actionIds={displayableActions}
      warning={retraceWarning}
      onSelect={handleRetraceAll}
      onSelectMax={handleRetraceMax}
    />

    <ScrollFade
      frameClass="col-span-3 min-h-0"
      scrollerClass="glass_scroll h-full overflow-y-auto px-3"
    >
      <div class="glass_kicker pb-2">Leap</div>
      <div class="grid gap-2">
        {#each availableRetraceLeaps as anchorItem (anchorItem.itemId)}
          <Button
            active
            accent={getLocationAccent(anchorItem.anchor.location)}
            testId={`retrace-leap-${anchorItem.itemId}`}
            className="w-full justify-items-start px-3 text-left"
            on:click={() =>
              handleRetraceAll(createRetraceLeapId(anchorItem.itemId))}
          >
            Leap to {getAnchorDestinationDisplayName(
              fake,
              anchorItem.anchor.location,
              anchorItem.anchor.sublocation,
            )}
          </Button>
        {/each}
        {#if availableRetraceLeaps.length === 0}
          <div class="subtle_text text-xs">
            No available destinations
          </div>
        {/if}
      </div>
    </ScrollFade>
  </div>

  <div class="glass_divider_top grid grid-cols-12 gap-2 py-2 text-center">
    <Button
      testId="save-retracing"
      on:click={saveRetracing}
      disabled={!selectedConfigId || !retraceName.trim()}
      className="col-span-5">Save plan</Button
    >
    <Button
      on:click={clearRetracing}
      className="col-span-3">Clear</Button
    >
    <Button
      className="col-span-4"
      on:click={() => $endRun && ($endRun.mainViewRoute = "endRun")}>Back</Button
    >
  </div>
</div>

<style>
  .retrace_config_row {
    display: grid;
    min-width: 0;
    grid-template-columns: repeat(6, minmax(160px, 1fr));
    gap: 8px;
    overflow-x: auto;
    padding: 1px 1px 4px;
    scrollbar-width: thin;
  }

  .retrace_config_button {
    display: flex;
    width: 100%;
    min-width: 0;
    height: 42px;
    align-items: center;
    gap: 8px;
    padding: 4px 5px 4px 12px;
    border: 1px solid var(--ui_stroke);
    border-radius: var(--ui_radius_control);
    outline: none;
    background: var(--ui_fill);
    color: var(--ui_text_muted);
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 7%);
    transition:
      border-color 140ms ease,
      background-color 140ms ease,
      color 140ms ease;
  }

  .retrace_config_button:hover,
  .retrace_config_button:focus-visible {
    border-color: rgb(var(--ui_accent) / 42%);
    background: var(--ui_fill_hover);
    color: var(--ui_text);
  }

  .retrace_config_button_active {
    border-color: rgb(var(--ui_accent) / 68%);
    background:
      linear-gradient(
        180deg,
        rgb(var(--ui_accent) / 18%),
        rgb(var(--ui_accent) / 8%)
      ),
      var(--ui_fill);
    color: var(--ui_text);
    box-shadow:
      inset 0 1px 0 rgb(208 255 241 / 16%),
      0 0 0 1px rgb(var(--ui_accent) / 10%);
  }

  .retrace_config_name {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    font-size: var(--ui_font_size_body);
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .retrace_config_name_input {
    min-width: 0;
    height: 30px;
    flex: 1;
    padding: 0 7px;
    border: 1px solid rgb(var(--ui_accent) / 42%);
    border-radius: 8px;
    outline: none;
    background: rgb(0 0 0 / 22%);
    color: var(--ui_text);
    font-weight: 700;
  }

  .retrace_config_name_input:focus {
    border-color: rgb(var(--ui_accent) / 72%);
    box-shadow: 0 0 0 2px rgb(var(--ui_accent) / 14%);
  }

  .retrace_config_edit,
  .retrace_config_delete,
  .retrace_config_add {
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid transparent;
    outline: none;
    color: var(--ui_text_muted);
    cursor: pointer;
    transition:
      background-color 140ms ease,
      border-color 140ms ease,
      color 140ms ease,
      transform 140ms ease;
  }

  .retrace_config_edit,
  .retrace_config_delete {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: rgb(255 255 255 / 5%);
  }

  .retrace_config_edit:hover:not(:disabled),
  .retrace_config_edit:focus-visible,
  .retrace_config_delete:hover,
  .retrace_config_delete:focus-visible,
  .retrace_config_add:hover,
  .retrace_config_add:focus-visible {
    border-color: rgb(var(--ui_accent) / 38%);
    background: rgb(var(--ui_accent) / 14%);
    color: rgb(var(--ui_accent));
  }

  .retrace_config_edit:active:not(:disabled),
  .retrace_config_delete:active,
  .retrace_config_add:active {
    transform: scale(0.96);
  }

  .retrace_config_edit:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .retrace_config_add {
    width: 42px;
    min-width: 42px;
    height: 42px;
    border-color: var(--ui_stroke);
    border-radius: var(--ui_radius_control);
    background: var(--ui_fill);
    justify-self: start;
  }

  .retrace_config_delete:hover,
  .retrace_config_delete:focus-visible {
    border-color: rgb(245 110 100 / 48%);
    background: rgb(245 110 100 / 12%);
    color: rgb(245 150 140);
  }
</style>
