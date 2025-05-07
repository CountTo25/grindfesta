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
  type RunState,
  type Skill,
  type SkillLevels,
} from "./types";
import { actions } from "./statics";
import {
  expToLevel,
  getModifier,
  processCleanGameState,
  syncToDebug,
} from "./utils";

const BASE_GAIN_RATE = 1;
const BASE_TPS = 20;
let bakedGainPerTick: number = BASE_GAIN_RATE / BASE_TPS;
let bakedTimePerTick: number = 1000 / BASE_TPS;
const BAKED_SKILL = {
  social: 1,
  exploration: 1,
  perception: 1,
};
export const bakery: {
  skills: { run: SkillLevels; global: SkillLevels };
  modifiers: SkillLevels;
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
  modifiers: { ...BAKED_SKILL },
};
/////
export const ticksPerSecond: Writable<number> = writable(BASE_TPS);
export const gameState: Writable<GameState> = writable(GameState.new());
export const actionsCheckSignal: Writable<boolean> = writable(false);
export const tickSignal: Writable<boolean> = writable(false);
export const bakeSignal: Writable<boolean> = writable(false);
export const endRun: Writable<RunState | null> = writable(null);
// tools
const flick = (v: boolean) => !v;
export const checkActions = () => actionsCheckSignal.update(flick);
export const sendBakeSignal = () => bakeSignal.update(flick);
/////
bakeSkillLevels();
/////
actionsCheckSignal.subscribe((_) => {
  gameState.update((state) => {
    if (!state.data.run.action) return state;
    let actionRef = actions[state.data.run.action.id]!;
    let progressRef =
      state.data.run.actionProgress[state.data.run.action.id].progress;
    if (progressRef >= actionRef.weight) {
      if (!actionRef.repeatable) {
        state.data.run.action = null;
      }
      let actions = Array.isArray(actionRef.postComplete)
        ? actionRef.postComplete
        : [actionRef.postComplete];

      for (let action of actions) {
        action(state);
      }
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
  [gameState, actionsCheckSignal],
  ([gs, _]) =>
    Object.entries(actions)
      .filter(([_, action]) => action.conditions.every((c) => c(gs)))
      .filter(canDisplay(gs))
      .map(([k, _]) => k),
  ["intro_0"]
);

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
  gameState.update((val) => {
    if (val.data.run.action) {
      val.data.run.timeSpent += bakedTimePerTick;
      val.data.run.energyDecayRate +=
        (val.data.run.energyDecayRate * 0.1) / bakedTimePerTick;
      val.data.run.currentEnergy -=
        val.data.run.energyDecayRate / bakedTimePerTick;
      if (val.data.run.currentEnergy <= 0) {
        endRun.set(val.data.run);
        val.data.run = processCleanGameState(EMPTY_RUN);
        bakeSkillLevels();
        return val;
      }
      const skill = actions[val.data.run.action.id]!.skill;
      let skillModifier = bakery.modifiers[skill];
      const actionProgressGain = bakedGainPerTick * skillModifier;
      if (val.data.run.actionProgress[val.data.run.action.id]) {
        val.data.run.actionProgress[val.data.run.action.id].progress +=
          actionProgressGain;
      } else {
        val.data.run.actionProgress[val.data.run.action.id] = {
          progress: actionProgressGain,
          complete: false,
        };
      }
      const rawSkillGain = Math.min(
        Math.max(actionProgressGain, 0),
        actions[val.data.run.action.id].weight
      );
      const skillGain = Math.min(
        rawSkillGain,
        val.data.run.actionProgress[val.data.run.action.id]?.progress ?? 0,
        actions[val.data.run.action.id].weight
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
        val.data.run.actionProgress[val.data.run.action.id].progress >=
        actions[val.data.run.action.id]?.weight
      ) {
        val.data.run.actionProgress[val.data.run.action.id].complete = true;
        checkActions();
      }
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
    action.repeatable ||
    !gs.data.run.actionProgress[id] ||
    !gs.data.run.actionProgress[id].complete;
}

function bakeSkillLevels() {
  let snap = get(gameState);
  for (const skill of ["exploration", "perception", "social"] as Skill[]) {
    let run = expToLevel(snap.data.run.stats[skill], 10);
    let global = expToLevel(snap.data.global.stats[skill], 25);
    bakery.skills.run[skill] = run.level;
    bakery.skills.global[skill] = global.level;
    bakery.modifiers[skill] =
      getModifier(run.level, 1.02) * getModifier(global.level, 1.01);
    bakery.toLevel.run.baseline[skill] = run.expToCurrent;
    bakery.toLevel.run.next[skill] = run.expToNext;
    bakery.toLevel.global.baseline[skill] = global.expToCurrent;
    bakery.toLevel.global.next[skill] = global.expToNext;
  }
  sendBakeSignal();
}
