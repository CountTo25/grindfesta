import {
  writable,
  get,
  type Writable,
  derived,
  type Readable,
} from "svelte/store";
import {
  EMPTY_RUN,
  GameState,
  type Action,
  type QueuedAction,
  type RetraceConfig,
  type RunState,
  type Skill,
  type SkillLevels,
} from "./types";
import { actions } from "./statics";
import {
  deepClone,
  expToLevel,
  getModifier,
  processCleanGameState,
  syncToDebug,
} from "./utils";
import { checkItems, save } from "./actions";
import type { ItemKey } from "./gameData/items";
import { applyMurmurTick } from "./gameData/murmur";
import {
  resolveUpgradeEffect,
  upgrades,
  type UpgradeKey,
} from "./gameData/upgrades";
import { distinctArrayProjection } from "./system/store";
import {
  applyAnchorLeap,
  getAnchorInventoryItems,
  getRetraceLeapItemId,
  isCurrentEraAnchor,
  type AnchorInventoryItem,
} from "./system/leap";

///Globals for quick tinkering here
const INITIAL_RUN_SKILL_LEVEL_EXP = 9;
const INITIAL_COMPRESSED_SKILL_LEVEL_EXP = 19;
export const GLOBAL_LEVEL_MOD_RATIO = 1.01;
export const RUN_LEVEL_MOD_RATIO = 1.07;
export const RUN_EXP_TO_LEVEL_BASE = INITIAL_RUN_SKILL_LEVEL_EXP;
// Replaces the old flat 1.35x XP gain with a gentler requirement curve.
export const RUN_EXP_GROWTH_RATIO = 1.1;
export const GLOBAL_EXP_GROWTH_RATIO = 1.02;
export const GLOBAL_EXP_TO_LEVEL_BASE = INITIAL_COMPRESSED_SKILL_LEVEL_EXP;
export const ENERGY_DECAY_DOUBLING_SECONDS = 180;
export const ENERGY_DECAY_GROWTH_RATE_PER_SECOND =
  Math.pow(2, 1 / ENERGY_DECAY_DOUBLING_SECONDS) - 1;
//
const DECAY_TEST_MOD = 1;
//const DECAY_TEST_MOD = 200;
//002;

///DEV
window.__dev = {
  sudoku: () => {
    gameState.update((gs) => {
      gs.data.run.currentEnergy = -1;
      sendActionCompleteSignal();
      return gs;
    });
  },
  state: () => get(gameState),
  reset: () => {
    localStorage.clear();
    window.location.reload();
  },
};

export const BASE_GAIN_RATE = 1;
export const BASE_TPS = 20;
let bakedGainPerTick: number = BASE_GAIN_RATE / BASE_TPS;
let bakedTimePerTick: number = 1000 / BASE_TPS;
const BAKED_SKILL: { [k in Skill]: number } = {
  social: 1,
  exploration: 1,
  perception: 1,
  engineering: 1,
  survival: 1,
  magic: 1,
};
export const bakery: {
  skills: { run: SkillLevels; global: SkillLevels };
  modifiers: { run: SkillLevels; global: SkillLevels; total: SkillLevels };
  toLevel: {
    run: { baseline: SkillLevels; next: SkillLevels };
    global: { baseline: SkillLevels; next: SkillLevels };
  };
} = {
  skills: {
    run: { ...BAKED_SKILL },
    global: { ...BAKED_SKILL },
  },
  toLevel: {
    run: {
      baseline: { ...BAKED_SKILL },
      next: { ...BAKED_SKILL },
    },
    global: {
      baseline: { ...BAKED_SKILL },
      next: { ...BAKED_SKILL },
    },
  },
  modifiers: {
    global: { ...BAKED_SKILL },
    total: { ...BAKED_SKILL },
    run: { ...BAKED_SKILL },
  },
};
export type BakedSkills = typeof bakery;
export function getBakedSkillsForState(snap: GameState): BakedSkills {
  const baked = deepClone(bakery);
  for (const skill of [
    "exploration",
    "perception",
    "social",
    "engineering",
    "survival",
    "magic",
  ] as Skill[]) {
    const run = expToLevel(
      snap.data.run.stats[skill],
      RUN_EXP_TO_LEVEL_BASE,
      RUN_EXP_GROWTH_RATIO,
      false,
    );
    const global = expToLevel(
      snap.data.global.stats[skill],
      GLOBAL_EXP_TO_LEVEL_BASE,
      GLOBAL_EXP_GROWTH_RATIO,
      false,
    );

    baked.skills.run[skill] = run.level;
    baked.skills.global[skill] = global.level;
    baked.modifiers.run[skill] = getModifier(run.level, RUN_LEVEL_MOD_RATIO);
    baked.modifiers.global[skill] = getModifier(
      global.level,
      GLOBAL_LEVEL_MOD_RATIO
    );
    baked.modifiers.total[skill] =
      baked.modifiers.run[skill] * baked.modifiers.global[skill];

    baked.toLevel.run.baseline[skill] = run.expToCurrent;
    baked.toLevel.run.next[skill] = run.expToNext;
    baked.toLevel.global.baseline[skill] = global.expToCurrent;
    baked.toLevel.global.next[skill] = global.expToNext;
  }
  return baked;
}

export function bakeStateSnapshot(snap: GameState): GameState {
  snap.data.run.bakery = getBakedSkillsForState(snap);
  return snap;
}
/////
export const ticksPerSecond: Writable<number> = writable(BASE_TPS);
export type SimulationTimeScale = 1 | 10 | 100;
export const simulationTimeScale: Writable<SimulationTimeScale> = writable(1);
export const gameState: Writable<GameState> = writable(GameState.new());
export const actionsCheckSignal: Writable<boolean> = writable(false);
export const tickSignal: Writable<boolean> = writable(false);
export const bakeSignal: Writable<boolean> = writable(false);
export const bakedSkills = derived(bakeSignal, () => bakery, bakery);
export const everyTenSeconds: Writable<boolean> = writable(false);
export const knowledgeSignal: Writable<boolean> = writable(false);
export const subLocationSignal: Writable<boolean> = writable(false);
export const actionEndSignal: Writable<boolean> = writable(false);
export const endRun: Writable<RunState | null> = writable(null);
export type RunDeathTransitionPhase = "idle" | "collapse" | "reveal";
export const runDeathTransition: Writable<RunDeathTransitionPhase> =
  writable("idle");
export const RUN_DEATH_COLLAPSE_MS = 1250;
export const RUN_DEATH_REVEAL_MS = 750;
let runDeathTransitionPending = false;
export type RunLoopTransitionPhase = "idle" | "cover" | "reveal";
export const runLoopTransition: Writable<RunLoopTransitionPhase> =
  writable("idle");
export const RUN_LOOP_COVER_MS = 180;
export const RUN_LOOP_REVEAL_MS = 320;
let runLoopTransitionPending = false;
export type { AnchorInventoryItem };
export const anchorItems: Readable<AnchorInventoryItem[]> = derived(
  gameState,
  getAnchorInventoryItems,
  [],
);
export const liveActionQueue = distinctArrayProjection(
  gameState,
  ($gameState) => [
    ...($gameState.data.run.activeQueuedAction
      ? [$gameState.data.run.activeQueuedAction]
      : []),
    ...$gameState.data.run.actionQueue,
  ],
);
export const queuedActionCountsById = derived(
  liveActionQueue,
  ($liveActionQueue) =>
    $liveActionQueue.reduce<Record<string, number>>((counts, { id }) => {
      counts[id] = (counts[id] ?? 0) + 1;
      return counts;
    }, {}),
);
type ActionQueueForecast = {
  estimatedSeconds: number;
  runTimeAtForecast: number;
};

const MAX_QUEUE_FORECAST_TICKS = 200_000;

const actionQueueForecast = derived(
  [liveActionQueue, bakedSkills, actionEndSignal, ticksPerSecond],
  ([$liveActionQueue, , , $ticksPerSecond]): ActionQueueForecast =>
    forecastActionQueue(
      get(gameState),
      $liveActionQueue,
      1000 / $ticksPerSecond,
    ),
  { estimatedSeconds: 0, runTimeAtForecast: 0 },
);

export const queuedActionEstimateSeconds = derived(
  [actionQueueForecast, gameState],
  ([$forecast, $gameState]) =>
    Math.max(
      0,
      $forecast.estimatedSeconds -
        ($gameState.data.run.timeSpent - $forecast.runTimeAtForecast) / 1000,
    ),
  0,
);
// tools
const flick = (v: boolean) => !v;
export const checkActions = () => actionsCheckSignal.update(flick);
export const sendBakeSignal = () => bakeSignal.update(flick);
export const sendActionCompleteSignal = () => actionEndSignal.update(flick);
export const sendKnowledgesignal = () => knowledgeSignal.update(flick);
export const sendSubLocationSignal = () => subLocationSignal.update(flick);
setInterval(() => everyTenSeconds.update(flick), 10 * 1000);

export function purchaseTimeLeapUpgrade(id: UpgradeKey): void {
  gameState.update((state) => {
    const upgrade = upgrades[id];
    if (
      state.data.global.purchased_upgrades.includes(id) ||
      upgrade.cost !== 0
    ) {
      return state;
    }

    state.data.global.purchased_upgrades.push(id);

    if (id === "timeline_stabilization") {
      const capacityGain =
        resolveUpgradeEffect(upgrade.effect) *
        state.data.global.reached_milestones.length;
      state.data.global.maxEnergy += capacityGain;
      state.data.run.maxEnergy += capacityGain;
      state.data.run.currentEnergy += capacityGain;
    }

    return state;
  });
}

export function beginNextLoopTransition(): void {
  if (runLoopTransitionPending || get(endRun) === null) return;

  runLoopTransitionPending = true;
  runLoopTransition.set("cover");

  globalThis.setTimeout(() => {
    gameState.update((state) => {
      clearRunActionQueue(state);
      state.data.run.actionQueue = buildRetraceQueue(state);
      return state;
    });
    endRun.set(null);
    sendSubLocationSignal();
    runLoopTransition.set("reveal");

    globalThis.setTimeout(() => {
      runLoopTransitionPending = false;
      runLoopTransition.set("idle");
    }, RUN_LOOP_REVEAL_MS);
  }, RUN_LOOP_COVER_MS);
}
export function applyRunTickCosts(state: GameState, tickMs: number): GameState {
  state = checkItems(state, tickMs);
  const elapsedSeconds = tickMs / 1000;
  state.data.run.energyDecayRate *= Math.pow(
    1 + ENERGY_DECAY_GROWTH_RATE_PER_SECOND,
    elapsedSeconds,
  );
  state.data.run.currentEnergy -=
    state.data.run.energyDecayRate * elapsedSeconds * DECAY_TEST_MOD;
  return state;
}

export function canStartAction(state: GameState, id: string): boolean {
  const action = actions[id];
  if (!action || !canDisplay(state)([id, action])) return false;
  if (!action.conditions.every((condition) => condition(state))) return false;
  if (
    !(action.revealCondition ?? []).every((condition) => condition(state))
  ) {
    return false;
  }
  return true;
}

export function canSkipUnavailableRetraceAction(
  state: GameState,
  id: string,
): boolean {
  const action = actions[id];
  return Boolean(
    action?.repeatable ||
      (action?.crossGeneration &&
        state.data.global.presistentActionProgress.includes(id)),
  );
}

export function completeSimulatedAction(
  state: GameState,
  id: string,
): GameState {
  const action = actions[id];
  const progress = state.data.run.actionProgress[id]!;

  if (!state.data.global.completedActionHistory.includes(id)) {
    state.data.global.completedActionHistory.push(id);
  }
  if (!action.repeatable) progress.complete = true;
  if (
    action.crossGeneration &&
    !state.data.global.presistentActionProgress.includes(id)
  ) {
    state.data.global.presistentActionProgress.push(id);
  }

  const effects = Array.isArray(action.postComplete)
    ? action.postComplete
    : [action.postComplete];
  for (const effect of effects) state = effect(state);

  if (action.repeatable || action.stopOnRepeat) {
    progress.complete = false;
    progress.progress = 0;
  }

  return bakeStateSnapshot(state);
}

export function simulateActionProgress(
  state: GameState,
  id: string,
  tickMs: number,
  tickBudget: { remaining: number },
): { state: GameState; completed: boolean; elapsedMs: number } {
  const action = actions[id];
  const progress = (state.data.run.actionProgress[id] ??= {
    progress: 0,
    complete: false,
  });
  let elapsedMs = 0;

  while (progress.progress < action.weight && tickBudget.remaining-- > 0) {
    state.data.run.timeSpent += tickMs;
    state = applyRunTickCosts(state, tickMs);
    elapsedMs += tickMs;
    if (state.data.run.currentEnergy <= 0) {
      state.data.run.currentEnergy = 0;
      return { state, completed: false, elapsedMs };
    }

    const baked =
      state.data.run.bakery ?? getBakedSkillsForState(state);
    const actionProgressGain =
      (BASE_GAIN_RATE / (1000 / tickMs)) *
      baked.modifiers.total[action.skill];
    progress.progress += actionProgressGain;

    const skillGain = Math.min(
      Math.max(actionProgressGain, 0),
      progress.progress,
      action.weight,
    );
    state.data.run.stats[action.skill] += skillGain;
    state.data.global.stats[action.skill] += skillGain;

    if (
      state.data.run.stats[action.skill] >=
        baked.toLevel.run.baseline[action.skill] +
          baked.toLevel.run.next[action.skill] ||
      state.data.global.stats[action.skill] >=
        baked.toLevel.global.baseline[action.skill] +
          baked.toLevel.global.next[action.skill]
    ) {
      state = bakeStateSnapshot(state);
    }
  }

  return {
    state,
    completed: progress.progress >= action.weight,
    elapsedMs,
  };
}

function forecastActionQueue(
  source: GameState,
  queue: readonly QueuedAction[],
  tickMs: number,
): ActionQueueForecast {
  const runTimeAtForecast = source.data.run.timeSpent;
  if (queue.length === 0) return { estimatedSeconds: 0, runTimeAtForecast };

  let state = bakeStateSnapshot(deepClone(source));
  let elapsedMs = 0;
  const pending = [...queue];
  const tickBudget = { remaining: MAX_QUEUE_FORECAST_TICKS };
  const active = source.data.run.activeQueuedAction;

  while (pending.length > 0 && tickBudget.remaining > 0) {
    const queuedAction = pending.shift()!;
    const leapItemId = getRetraceLeapItemId(queuedAction.id);
    if (leapItemId) {
      state.data.run.action = null;
      if (!applyRetraceLeap(state, leapItemId)) {
        removeRemainingRetraceSteps(pending);
      }
      continue;
    }

    const isRunning =
      queuedAction === queue[0] &&
      active !== null &&
      state.data.run.action?.id === queuedAction.id;

    if (!isRunning && !canStartAction(state, queuedAction.id)) {
      if (
        queuedAction.source === "retrace" &&
        !canSkipUnavailableRetraceAction(state, queuedAction.id)
      ) {
        for (let index = pending.length - 1; index >= 0; index--) {
          if (pending[index].source === "retrace") pending.splice(index, 1);
        }
      }
      continue;
    }

    do {
      state.data.run.action = { id: queuedAction.id };
      const result = simulateActionProgress(
        state,
        queuedAction.id,
        tickMs,
        tickBudget,
      );
      state = result.state;
      elapsedMs += result.elapsedMs;
      if (!result.completed) {
        return {
          estimatedSeconds: elapsedMs / 1000,
          runTimeAtForecast,
        };
      }

      state = completeSimulatedAction(state, queuedAction.id);
      if (
        queuedAction.mode === "once" ||
        actions[queuedAction.id].stopOnRepeat ||
        !canStartAction(state, queuedAction.id)
      ) {
        break;
      }
    } while (tickBudget.remaining > 0);
  }

  return { estimatedSeconds: elapsedMs / 1000, runTimeAtForecast };
}

function applyRetraceLeap(
  state: GameState,
  itemId: ItemKey,
  notify = false,
): boolean {
  const anchorItem = getAnchorInventoryItems(state).find(
    (candidate) => candidate.itemId === itemId,
  );
  if (!anchorItem || isCurrentEraAnchor(state, anchorItem)) return false;

  applyAnchorLeap(state, anchorItem);
  if (notify) {
    sendSubLocationSignal();
    checkActions();
  }
  return true;
}

function removeRemainingRetraceSteps(queue: QueuedAction[]): void {
  for (let index = queue.length - 1; index >= 0; index--) {
    if (queue[index].source === "retrace") queue.splice(index, 1);
  }
}

export function estimateRetracingPlan(source: GameState): {
  configName: string | null;
  actionCount: number;
  estimatedSeconds: number;
} {
  const config = getActiveRetraceConfig(source);
  const configName = config?.name ?? null;
  const actionCount = config?.actions.length ?? 0;
  if (actionCount === 0) {
    return { configName, actionCount, estimatedSeconds: 0 };
  }

  const nextRun = deepClone(source);
  nextRun.data.run = deepClone(EMPTY_RUN);
  const { estimatedSeconds } = forecastActionQueue(
    nextRun,
    buildRetraceQueue(nextRun),
    1000 / BASE_TPS,
  );

  return { configName, actionCount, estimatedSeconds };
}

export function getActiveRetraceConfig(source: GameState): RetraceConfig | null {
  const { activeRetraceConfigId, retraceConfigs } = source.data.global;
  return (
    retraceConfigs.find(({ id }) => id === activeRetraceConfigId) ??
    retraceConfigs[0] ??
    null
  );
}

export function clearRunActionQueue(state: GameState): void {
  state.data.run.retraceIdx = null;
  state.data.run.action = null;
  state.data.run.activeQueuedAction = null;
  state.data.run.actionQueue = [];
}

export function stopRunAction(): void {
  gameState.update((state) => {
    clearRunActionQueue(state);
    return state;
  });
}

function buildRetraceQueue(state: GameState, startIndex = 0): QueuedAction[] {
  return (getActiveRetraceConfig(state)?.actions ?? [])
    .slice(startIndex)
    .map(({ id }) => ({
      id,
      mode: "once",
      source: "retrace",
    }));
}

function absorbLegacyRetracing(state: GameState): void {
  const retraceIdx = state.data.run.retraceIdx;
  if (retraceIdx === null) return;

  if (state.data.run.action && !state.data.run.activeQueuedAction) {
    state.data.run.activeQueuedAction = {
      id: state.data.run.action.id,
      mode: "once",
      source: "retrace",
    };
  }

  state.data.run.actionQueue = [
    ...buildRetraceQueue(state, retraceIdx),
    ...state.data.run.actionQueue,
  ];
  state.data.run.retraceIdx = null;
}

function startNextQueuedAction(state: GameState): GameState {
  state.data.run.activeQueuedAction = null;

  while (state.data.run.actionQueue.length > 0) {
    const queuedAction = state.data.run.actionQueue.shift()!;
    const leapItemId = getRetraceLeapItemId(queuedAction.id);
    if (leapItemId) {
      state.data.run.action = null;
      if (!applyRetraceLeap(state, leapItemId, true)) {
        state.data.run.actionQueue = state.data.run.actionQueue.filter(
          (entry) => entry.source !== "retrace",
        );
      }
      continue;
    }

    if (!canStartAction(state, queuedAction.id)) {
      if (
        queuedAction.source === "retrace" &&
        !canSkipUnavailableRetraceAction(state, queuedAction.id)
      ) {
        state.data.run.actionQueue = state.data.run.actionQueue.filter(
          (entry) => entry.source !== "retrace",
        );
      }
      continue;
    }

    state.data.run.activeQueuedAction = queuedAction;
    state.data.run.action = { id: queuedAction.id };
    return state;
  }

  return state;
}

function queueRunAction(
  id: string,
  singleRun: boolean,
  replaceQueue: boolean,
): void {
  const action = actions[id];
  if (!action) return;

  const queuedAction: QueuedAction = {
    id,
    mode: action.repeatable && !singleRun ? "max" : "once",
    source: "manual",
  };

  gameState.update((state) => {
    if (!canStartAction(state, id)) return state;

    if (replaceQueue) {
      clearRunActionQueue(state);
      state.data.run.actionQueue.push(queuedAction);
      return startNextQueuedAction(state);
    }

    const queueIsIdle =
      state.data.run.activeQueuedAction === null &&
      state.data.run.actionQueue.length === 0;

    if (queueIsIdle) state.data.run.action = null;
    state.data.run.actionQueue.push(queuedAction);
    return queueIsIdle ? startNextQueuedAction(state) : state;
  });
}

export function enqueueRunAction(id: string, singleRun = false): void {
  queueRunAction(id, singleRun, false);
}

export function playRunAction(id: string): void {
  queueRunAction(id, false, true);
}

export function removeRunActionFromQueue(index: number, count = 1): void {
  gameState.update((state) => {
    const hasActiveAction = state.data.run.activeQueuedAction !== null;
    let remainingCount = Math.max(1, Math.floor(count));
    let queuedIndex = index - (hasActiveAction ? 1 : 0);

    if (hasActiveAction && index === 0) {
      state.data.run.activeQueuedAction = null;
      state.data.run.action = null;
      remainingCount -= 1;
      queuedIndex = 0;
    }

    if (
      remainingCount > 0 &&
      queuedIndex >= 0 &&
      queuedIndex < state.data.run.actionQueue.length
    ) {
      state.data.run.actionQueue.splice(queuedIndex, remainingCount);
    }

    return hasActiveAction && index === 0
      ? startNextQueuedAction(state)
      : state;
  });
}

function beginRunDeathTransition(): void {
  if (runDeathTransitionPending) return;

  runDeathTransitionPending = true;
  runDeathTransition.set("collapse");

  globalThis.setTimeout(() => {
    gameState.update((state) => {
      state.data.run.mainViewRoute = "endRun";
      endRun.set(state.data.run);
      state.data.global.previous_run_milestone_entries = deepClone(
        state.data.global.last_run_milestone_entries,
      );
      state.data.global.last_run_milestone_entries = deepClone(
        state.data.run.milestoneEntries,
      );
      state.data.run = processCleanGameState(EMPTY_RUN);
      state.data.run.maxEnergy = state.data.global.maxEnergy;
      state.data.run.currentEnergy = state.data.global.maxEnergy;
      bakeSkillLevels();
      state.data.run.initialStats = deepClone(bakery.skills.global);
      state.data.global.loop = state.data.global.loop + 1;
      checkActions();
      bakeSkillLevels();
      return state;
    });

    runDeathTransition.set("reveal");

    globalThis.setTimeout(() => {
      runDeathTransitionPending = false;
      runDeathTransition.set("idle");
    }, RUN_DEATH_REVEAL_MS);
  }, RUN_DEATH_COLLAPSE_MS);
}
/////
bakeSkillLevels();
/////
everyTenSeconds.subscribe(save(gameState));

actionsCheckSignal.subscribe((_) => {
  let actionEnded = false;
  gameState.update((state) => {
    if (!state.data.run.action) return state;
    const ACTION_ID = state.data.run.action.id;
    let actionRef = actions[ACTION_ID]!;
    if (!state.data.run.actionProgress[ACTION_ID]) {
      state.data.run.actionProgress[ACTION_ID] = {
        progress: 0,
        complete: false,
      };
    }
    let progressRef = state.data.run.actionProgress[ACTION_ID].progress;
    if (progressRef >= actionRef.weight) {
      if (!state.data.global.completedActionHistory.includes(ACTION_ID)) {
        state.data.global.completedActionHistory.push(ACTION_ID);
      }
      let actions = Array.isArray(actionRef.postComplete)
        ? actionRef.postComplete
        : [actionRef.postComplete];

      for (let action of actions) {
        action(state);
      }
      if (!actionRef.repeatable) {
        state.data.run.action = null;
      } else {
        state.data.run.actionProgress[ACTION_ID].progress = 0;
        state.data.run.actionProgress[ACTION_ID].complete = false;
        if (
          actionRef.revealCondition !== undefined &&
          !actionRef.revealCondition.every((c) => c(state))
        ) {
          state.data.run.action = null;
          state.data.run.actionProgress[ACTION_ID].progress = 0;
        }
        if (
          actionRef.conditions !== undefined &&
          !actionRef.conditions.every((c) => c(state))
        ) {
          state.data.run.action = null;
          state.data.run.actionProgress[ACTION_ID].progress = 0;
        }
        // One-shot queue entries advance after one completion.
        if (
          state.data.run.activeQueuedAction?.id === ACTION_ID &&
          state.data.run.activeQueuedAction.mode === "once"
        ) {
          state.data.run.action = null;
        }
      }

      if (!!actionRef.stopOnRepeat) {
        state.data.run.action = null;
        state.data.run.actionProgress[ACTION_ID].progress = 0;
        state.data.run.actionProgress[ACTION_ID].complete = false;
      }

      if (
        state.data.run.activeQueuedAction?.id === ACTION_ID &&
        state.data.run.action === null
      ) {
        state.data.run.activeQueuedAction = null;
      }
    }
    if (state.data.run.actionProgress[ACTION_ID].progress === 0) {
      actionEnded = true;
    }
    return state;
  });
  if (actionEnded) sendActionCompleteSignal();
});
export const gainPerTick = derived(
  [ticksPerSecond, gameState],
  ([ticksPerSecond, gameState]) => {
    bakedGainPerTick = BASE_GAIN_RATE / ticksPerSecond;
    bakedGainPerTick;
  }
);
export const displayableActions: Readable<string[]> = derived(
  [actionsCheckSignal],
  ([_]) =>
    Object.entries(actions)
      .filter(([_, action]) =>
        action.conditions.every((c) => c(get(gameState)))
      )
      .filter(canDisplay(get(gameState)))
      .map(([k, _]) => k),
  ["intro_0"]
);

export const ghostDisplayableActions: (r: GameState) => string[] = (r) => {
  return (
    Object.entries(actions)
      .filter(([_, action]) => action.conditions.every((c) => c(r)))
      .filter(canDisplay(r))
      .map(([k, _]) => k) ?? ["intro_0"]
  );
};

/// etc system
let _ticker: number;
const ticker = derived(
  [ticksPerSecond, simulationTimeScale],
  ([ticksPerSecond, timeScale]) => {
    _ticker && clearInterval(_ticker);
    bakedTimePerTick = 1000 / ticksPerSecond;
    _ticker = setInterval(() => {
      for (let tick = 0; tick < timeScale; tick++) {
        tickSignal.update(flick);
      }
    }, bakedTimePerTick);
    return _ticker;
  },
  null
);

//tick handler
tickSignal.subscribe((_) => {
  if (runDeathTransitionPending || runLoopTransitionPending) return;

  gameState.update((val) => {
    absorbLegacyRetracing(val);

    //lets treat it as separate module for ease of understanding
    if (val.data.run.action) {
      const ACTION_ID: string = val.data.run.action.id;
      val.data.run.timeSpent += bakedTimePerTick;
      val = applyRunTickCosts(val, bakedTimePerTick);
      if (val.data.run.currentEnergy <= 0) {
        val.data.run.currentEnergy = 0;
        beginRunDeathTransition();
        return val;
      }
      val = applyMurmurTick(val, bakedTimePerTick);
      const skill = actions[ACTION_ID]!.skill;
      let skillModifier = bakery.modifiers.total[skill];
      const actionProgressGain = bakedGainPerTick * skillModifier;
      if (val.data.run.actionProgress[ACTION_ID]) {
        val.data.run.actionProgress[ACTION_ID].progress += actionProgressGain;
      } else {
        val.data.run.actionProgress[ACTION_ID] = {
          progress: actionProgressGain,
          complete: false,
        };
      }
      const rawSkillGain = Math.min(
        Math.max(actionProgressGain, 0),
        actions[ACTION_ID].weight
      );
      const skillGain = Math.min(
        rawSkillGain,
        val.data.run.actionProgress[ACTION_ID]?.progress ?? 0,
        actions[ACTION_ID].weight
      );
      val.data.run.stats[skill] += skillGain;
      val.data.global.stats[skill] += skillGain;

      if (
        val.data.run.stats[skill] >=
          bakery.toLevel.run.baseline[skill] + bakery.toLevel.run.next[skill] ||
        val.data.global.stats[skill] >=
          bakery.toLevel.global.baseline[skill] +
            bakery.toLevel.global.next[skill]
      ) {
        bakeSkillLevels();
      }
      if (
        val.data.run.actionProgress[ACTION_ID].progress >=
        actions[ACTION_ID]?.weight
      ) {
        if (!actions[ACTION_ID]!.repeatable) {
          val.data.run.actionProgress[ACTION_ID].complete = true;
        }
        if (actions[ACTION_ID].crossGeneration) {
          val.data.global.presistentActionProgress.push(ACTION_ID);
        }
        //if it repeatable, but invisible — stop
        checkActions();
      }
    } else {
      if (val.data.run.activeQueuedAction !== null) {
        val.data.run.activeQueuedAction = null;
      }
      startNextQueuedAction(val);
    }
    return val;
  });
});

// phantom subs
const _tickerUnsub = ticker.subscribe((_) => null);
const _gptUnsub = gainPerTick.subscribe((_) => null);

//etc utils
function canDisplay(
  gs: GameState
): ([id, action]: [string, Action]) => boolean {
  return ([id, action]: [string, Action]) =>
    (action.repeatable ||
      !gs.data.run.actionProgress[id] ||
      !gs.data.run.actionProgress[id].complete) &&
    (!action.crossGeneration ||
      !gs.data.global.presistentActionProgress.includes(id));
}

function bakeSkillLevels() {
  let snap = get(gameState);
  const baked = getBakedSkillsForState(snap);
  bakery.skills = baked.skills;
  bakery.modifiers = baked.modifiers;
  bakery.toLevel = baked.toLevel;
  gameState.update((gs) => bakeStateSnapshot(gs));
  sendBakeSignal();
}
