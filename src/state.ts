import { writable, type Writable, derived, type Readable } from "svelte/store";
import { GameState, type Action } from "./types";
import { actions } from "./statics";
import { syncToDebug } from "./utils";

const BASE_GAIN_RATE = 1;
const BASE_TPS = 20;
let bakedGainPerTick: number = BASE_GAIN_RATE / BASE_TPS;
let bakedTimePerTick: number = 1000 / BASE_TPS;
export const ticksPerSecond: Writable<number> = writable(BASE_TPS);
export const gameState: Writable<GameState> = writable(GameState.new());
export const actionsCheckSignal: Writable<boolean> = writable(false);
export const tickSignal: Writable<boolean> = writable(false);
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
      actionRef.postComplete && actionRef.postComplete(state);
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
  ["la_intro_0"]
);

// tools
const flick = (v: boolean) => !v;
export const checkActions = () => actionsCheckSignal.update(flick);

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
      if (val.data.run.actionProgress[val.data.run.action.id]) {
        val.data.run.actionProgress[val.data.run.action.id].progress +=
          bakedGainPerTick;
      } else {
        val.data.run.actionProgress[val.data.run.action.id] = {
          progress: bakedGainPerTick,
          complete: false,
        };
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
