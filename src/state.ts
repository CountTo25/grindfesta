import { writable, type Writable, derived, type Readable } from "svelte/store";
import { GameState } from "./types";
import { actions } from "./statics";
import { syncToDebug } from "./utils";

export const gameState: Writable<GameState> = writable(GameState.new());
export const actionsCheckSignal: Writable<boolean> = writable(false);
export const checkActions = () => actionsCheckSignal.update((v) => !v);
export const displayableActions: Readable<string[]> = derived(
  [gameState, actionsCheckSignal],
  ([gs, _]) =>
    Object.entries(actions)
      .filter(([_, action]) => action.conditions.every((c) => c(gs)))
      .map(([k, _]) => k),
  ["la_intro_0"]
);
