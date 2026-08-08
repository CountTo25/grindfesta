import { items, type ItemKey } from "../gameData/items";
import type { GameState, Item } from "../types";

export type AnchorInventoryItem = {
  itemId: ItemKey;
  item: Item;
  amount: number;
  anchor: NonNullable<Item["anchor"]>;
};

export const LEAP_ENERGY_DECAY_MULTIPLIER = 2;
const RETRACE_LEAP_PREFIX = "retrace-leap:";

export function createRetraceLeapId(itemId: ItemKey) {
  return `${RETRACE_LEAP_PREFIX}${itemId}`;
}

export function getRetraceLeapItemId(id: string): ItemKey | null {
  if (!id.startsWith(RETRACE_LEAP_PREFIX)) return null;
  const itemId = id.slice(RETRACE_LEAP_PREFIX.length);
  return itemId ? (itemId as ItemKey) : null;
}

export function getPostLeapEnergyDecayRate(currentDecayRate: number) {
  return currentDecayRate * LEAP_ENERGY_DECAY_MULTIPLIER;
}

export function isCurrentEraAnchor(
  gameState: GameState,
  anchorItem: AnchorInventoryItem,
) {
  return gameState.data.run.location === anchorItem.anchor.location;
}

export function getAnchorInventoryItems(
  gameState: GameState,
): AnchorInventoryItem[] {
  return Object.entries(gameState.data.run.inventory).flatMap(
    ([rawId, slot]) => {
      if ((slot?.amount ?? 0) <= 0) return [];
      const itemId = rawId as ItemKey;
      const item = items[itemId] as Item | undefined;
      if (!item?.anchor) return [];
      return [{ itemId, item, amount: slot.amount, anchor: item.anchor }];
    },
  );
}

export function applyAnchorLeap(
  gameState: GameState,
  anchorItem: AnchorInventoryItem,
) {
  if (isCurrentEraAnchor(gameState, anchorItem)) return gameState;

  gameState.data.run.energyDecayRate = getPostLeapEnergyDecayRate(
    gameState.data.run.energyDecayRate,
  );
  gameState.data.run.location = anchorItem.anchor.location;
  gameState.data.run.subLocation = anchorItem.anchor.sublocation;
  return gameState;
}
