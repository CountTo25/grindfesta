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
  type Item,
  type QueuedAction,
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
import { items, type ItemKey } from "./gameData/items";
import { distinctArrayProjection } from "./system/store";

///Globals for quick tinkering here
export const GLOBAL_LEVEL_MOD_RATIO = 1.05;
export const RUN_LEVEL_MOD_RATIO = 1.08;
export const RUN_EXP_TO_LEVEL_RATIO = 5;
export const RUN_SKILL_GAIN_MOD = 1.35;
export const GLOBAL_SKILL_GAIN_MOD = 1.35;
//
const DECAY_TEST_MOD = 1;
//const DECAY_TEST_MOD = 200;
//002;

///DEV
//@ts-ignore
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
  ] as Skill[]) {
    const run = expToLevel(snap.data.run.stats[skill], RUN_EXP_TO_LEVEL_RATIO);
    const global = expToLevel(snap.data.global.stats[skill], 15);

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
export type AnchorInventoryItem = {
  itemId: ItemKey;
  item: Item;
  amount: number;
  anchor: NonNullable<Item["anchor"]>;
};
export const anchorItems: Readable<AnchorInventoryItem[]> = derived(
  gameState,
  ($gameState) =>
    Object.entries($gameState.data.run.inventory).flatMap(([rawId, slot]) => {
      if ((slot?.amount ?? 0) <= 0) return [];
      const itemId = rawId as ItemKey;
      const item = items[itemId] as Item | undefined;
      if (!item?.anchor) return [];
      return [
        {
          itemId,
          item,
          amount: slot.amount,
          anchor: item.anchor,
        },
      ];
    }),
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
export const queuedActionEstimateSeconds = derived(
  [liveActionQueue, bakedSkills],
  ([$liveActionQueue, $bakedSkills]) =>
    $liveActionQueue.reduce((total, queuedAction) => {
      const action = actions[queuedAction.id];
      if (!action) return total;

      const modifier = $bakedSkills.modifiers.total[action.skill] || 1;
      return total + action.weight / modifier;
    }, 0),
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
  state.data.run.energyDecayRate +=
    (state.data.run.energyDecayRate * 0.03) / tickMs;
  state.data.run.currentEnergy -=
    (state.data.run.energyDecayRate / tickMs) * DECAY_TEST_MOD;
  return state;
}

export function canStartAction(state: GameState, id: string): boolean {
  const action = actions[id];
  if (!action || !canDisplay(state)([id, action])) return false;
  if (!action.conditions.every((condition) => condition(state))) return false;
  return (action.revealCondition ?? []).every((condition) => condition(state));
}

export function canSkipUnavailableRetraceAction(id: string): boolean {
  return actions[id]?.repeatable ?? false;
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
  return state.data.global.retraceConfig.slice(startIndex).map(({ id }) => ({
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
    if (!canStartAction(state, queuedAction.id)) {
      if (
        queuedAction.source === "retrace" &&
        !canSkipUnavailableRetraceAction(queuedAction.id)
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

export function enqueueRunAction(id: string, singleRun = false): void {
  const action = actions[id];
  if (!action) return;

  const queuedAction: QueuedAction = {
    id,
    mode: action.repeatable && !singleRun ? "max" : "once",
    source: "manual",
  };

  gameState.update((state) => {
    if (!canStartAction(state, id)) return state;

    const queueIsIdle =
      state.data.run.activeQueuedAction === null &&
      state.data.run.actionQueue.length === 0;

    if (queueIsIdle) state.data.run.action = null;
    state.data.run.actionQueue.push(queuedAction);
    return queueIsIdle ? startNextQueuedAction(state) : state;
  });
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
      state.data.run = processCleanGameState(EMPTY_RUN);
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
      sendActionCompleteSignal();
    }
    return state;
  });
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
  [ticksPerSecond],
  ([ticksPerSecond]) => {
    _ticker && clearInterval(_ticker);
    bakedTimePerTick = 1000 / ticksPerSecond;
    _ticker = setInterval(() => tickSignal.update(flick), bakedTimePerTick);
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
      val.data.run.stats[skill] += skillGain * RUN_SKILL_GAIN_MOD;
      val.data.global.stats[skill] += skillGain * GLOBAL_SKILL_GAIN_MOD;

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
