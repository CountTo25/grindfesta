import {
  checkActions,
  sendSubLocationSignal,
  type AnchorInventoryItem,
} from "../state";
import type { GameState } from "../types";

export type { AnchorInventoryItem };

export const LEAP_ENERGY_DECAY_MULTIPLIER = 2;

export function getPostLeapEnergyDecayRate(currentDecayRate: number) {
  return currentDecayRate * LEAP_ENERGY_DECAY_MULTIPLIER;
}

export function applyAnchorLeap(
  gameState: GameState,
  anchorItem: AnchorInventoryItem,
) {
  gameState.data.run.action = null;
  gameState.data.run.energyDecayRate = getPostLeapEnergyDecayRate(
    gameState.data.run.energyDecayRate,
  );
  gameState.data.run.location = anchorItem.anchor.location;
  gameState.data.run.subLocation = anchorItem.anchor.sublocation;
  sendSubLocationSignal();
  checkActions();
  return gameState;
}
