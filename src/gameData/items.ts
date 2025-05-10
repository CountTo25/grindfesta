import type { Item } from "../types";

// Step 1: Define the items with `as const` to preserve literal keys
export const items = {
  narcadia641_zenny: {
    name: "Zenny",
    description: "A single coin",
  },
  small_battery: {
    name: "Small battery",
    description: "Restores 1 energy",
  },
} as const satisfies Record<string, Item>;

// Step 2: Create a type that extracts the keys
export type ItemKey = keyof typeof items;
