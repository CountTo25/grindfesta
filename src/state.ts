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

const GLOBAL_LEVEL_MOD_RATIO = 1.12;

const BASE_GAIN_RATE = 1;
const BASE_TPS = 20;
let bakedGainPerTick: number = BASE_GAIN_RATE / BASE_TPS;
let bakedTimePerTick: number = 1000 / BASE_TPS;
const BAKED_SKILL: { [k in Skill]: number } = {
  social: 1,
  exploration: 1,
  perception: 1,
  engineering: 1,
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
export type BakedSkills = typeof bakery;
/////
export const ticksPerSecond: Writable<number> = writable(BASE_TPS);
export const gameState: Writable<GameState> = writable(GameState.new());
export const actionsCheckSignal: Writable<boolean> = writable(false);
export const tickSignal: Writable<boolean> = writable(false);
export const bakeSignal: Writable<boolean> = writable(false);
export const everyTenSeconds: Writable<boolean> = writable(false);
export const knowledgeSignal: Writable<boolean> = writable(false);
export const subLocationSignal: Writable<boolean> = writable(false);
export const actionEndSignal: Writable<boolean> = writable(false);
export const endRun: Writable<RunState | null> = writable(null);
// tools
const flick = (v: boolean) => !v;
export const checkActions = () => actionsCheckSignal.update(flick);
export const sendBakeSignal = () => bakeSignal.update(flick);
export const sendActionCompleteSignal = () => actionEndSignal.update(flick);
export const sendKnowledgesignal = () => knowledgeSignal.update(flick);
export const sendSubLocationSignal = () => subLocationSignal.update(flick);
setInterval(() => everyTenSeconds.update(flick), 10 * 1000);
/////
bakeSkillLevels();
/////
everyTenSeconds.subscribe((_) =>
  localStorage.setItem("save_0", JSON.stringify(get(gameState).data))
);

actionsCheckSignal.subscribe((_) => {
  gameState.update((state) => {
    if (!state.data.run.action) return state;
    const ACTION_ID = state.data.run.action.id;
    let actionRef = actions[ACTION_ID]!;
    let progressRef = state.data.run.actionProgress[ACTION_ID].progress;
    if (progressRef >= actionRef.weight) {
      let actions = Array.isArray(actionRef.postComplete)
        ? actionRef.postComplete
        : [actionRef.postComplete];

      for (let action of actions) {
        action(state);
      }
      if (!actionRef.repeatable) {
        state.data.run.action = null;
      } else {
        if (!!actionRef.grants) {
          for (const itemId of actionRef.grants) {
            if (!state.data.run.inventory[itemId]) {
              state.data.run.inventory[itemId] = 0;
            }
            if (
              state.data.run.inventory[itemId] <
              state.data.run.inventoryCapacity
            ) {
              state.data.run.inventory[itemId]++;
              if (
                state.data.run.inventory[itemId] >=
                state.data.run.inventoryCapacity
              ) {
                state.data.run.action = null;
              }
            }
          }
        }
        state.data.run.actionProgress[ACTION_ID].progress = 0;
        state.data.run.actionProgress[ACTION_ID].complete = false;
        if (
          actionRef.revealCondition !== undefined &&
          !actionRef.revealCondition.every((c) => c(state))
        ) {
          state.data.run.action = null;
          state.data.run.actionProgress[ACTION_ID].progress = 0;
        }
      }

      if (!!actionRef.stopOnRepeat) {
        state.data.run.action = null;
        state.data.run.actionProgress[ACTION_ID].progress = 0;
        state.data.run.actionProgress[ACTION_ID].complete = false;
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
    //leets treat is as separate module for ease of understanding
    if (val.data.run.action) {
      const ACTION_ID: string = val.data.run.action.id;
      val.data.run.timeSpent += bakedTimePerTick;
      val.data.run.energyDecayRate +=
        (val.data.run.energyDecayRate * 0.05) / bakedTimePerTick;
      val.data.run.currentEnergy -=
        val.data.run.energyDecayRate / bakedTimePerTick;
      if (val.data.run.currentEnergy <= 0) {
        endRun.set(val.data.run);
        val.data.run = processCleanGameState(EMPTY_RUN);
        checkActions();
        bakeSkillLevels();

        return val;
      }
      const skill = actions[ACTION_ID]!.skill;
      let skillModifier = bakery.modifiers[skill];
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
      val.data.run.stats[skill] += skillGain * 1.3;
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
    (action.repeatable ||
      !gs.data.run.actionProgress[id] ||
      !gs.data.run.actionProgress[id].complete) &&
    (!action.crossGeneration ||
      !gs.data.global.presistentActionProgress.includes(id));
}

function bakeSkillLevels() {
  let snap = get(gameState);
  for (const skill of [
    "exploration",
    "perception",
    "social",
    "engineering",
  ] as Skill[]) {
    let run = expToLevel(snap.data.run.stats[skill], 10);
    let global = expToLevel(snap.data.global.stats[skill], 20);
    bakery.skills.run[skill] = run.level;
    bakery.skills.global[skill] = global.level;
    bakery.modifiers[skill] =
      getModifier(run.level, 1.04) *
      getModifier(global.level, GLOBAL_LEVEL_MOD_RATIO);
    bakery.toLevel.run.baseline[skill] = run.expToCurrent;
    bakery.toLevel.run.next[skill] = run.expToNext;
    bakery.toLevel.global.baseline[skill] = global.expToCurrent;
    bakery.toLevel.global.next[skill] = global.expToNext;
    gameState.update((gs) => {
      gs.data.run.bakery = bakery;
      return gs;
    });
  }
  sendBakeSignal();
}
