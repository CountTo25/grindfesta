import { get, type Writable } from "svelte/store";
import { items, type ItemKey } from "./gameData/items";
import type { GameState } from "./types";

export function checkItems(state: GameState, tickProgress: number): GameState {
  let consumable_ids = Object.entries(state.data.run.inventory)
    .filter(([k, _]) => items[k as ItemKey]!.consumable)
    .filter(([_, v]) => v.amount >= 0)
    .map(([k, _]) => k as ItemKey);
  for (const id of consumable_ids) {
    console.log(tickProgress);
    if (state.data.run.inventory[id]!.cooldown > 0) {
      state.data.run.inventory[id]!.cooldown = Math.max(
        0,
        state.data.run.inventory[id]!.cooldown - tickProgress
      );
    }
    if (state.data.run.inventory[id]?.amount === 0) {
      return state;
    }
    if (state.data.run.inventory[id]!.cooldown <= 0) {
      let requirements = items[id].consumeRequirement;
      let runRequirements;
      if (!Array.isArray(requirements)) {
        runRequirements = [requirements];
      } else {
        runRequirements = requirements;
      }

      if (runRequirements.every((r) => r(state))) {
        let effects = items[id].onConsume;
        let runEffects;
        if (!Array.isArray(effects)) {
          runEffects = [effects];
        } else {
          runEffects = effects;
        }

        for (const effect of runEffects) {
          state = effect(state);
        }

        state.data.run.inventory[id]!.amount--;
        state.data.run.inventory[id]!.cooldown = 5000;
      }
    }
  }
  return state;
}

export function save(gameState: Writable<GameState>): (_: any) => void {
  return (_) => {
    console.log("saving!");
    localStorage.setItem("save_0", JSON.stringify(get(gameState).data));
  };
}
