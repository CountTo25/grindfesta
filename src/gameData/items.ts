import type { GameState, Item } from "../types";
import { TAGS } from "./tags";

// Step 1: Define the items with `as const` to preserve literal keys
export const items = {
  narcadia641_zenny: {
    name: "Zenny",
    description: "A single coin",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (c) => {
      let junkWalletMod =
        c.data.run.flags[TAGS.MODIFIERS.HAS_JUNK_WALLET] ?? null ? 10 : 0;
      return 10 + junkWalletMod;
    },
  },
  small_battery: {
    name: "Small battery",
    description: "Restores 1 energy",
    consumable: true,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy < s.data.run.maxEnergy - 1;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 1,
        s.data.run.maxEnergy
      );
      return s;
    },
    capacity: (_) => 10,
  },
  charged_battery: {
    name: "Charged battery",
    description: "Restores 2 energy",
    consumable: true,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy < s.data.run.maxEnergy - 2;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 2,
        s.data.run.maxEnergy
      );
      return s;
    },
    capacity: (_) => 10,
  },
  naws_museum_ticket: {
    name: "NAWS History Museum ticket",
    description: "One admission",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 10,
  },
  na641_broken_camera: {
    name: "Broken instant camera",
    description: "Could be fixed",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_fixed_camera: {
    name: "5-shot instant camera",
    description: "For precious moments",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 5,
  },
} as const satisfies Record<string, Item>;

// Step 2: Create a type that extracts the keys
export type ItemKey = keyof typeof items;
