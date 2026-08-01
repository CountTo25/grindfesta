import type { GameState, Item } from "../types";
import { LOCATIONS, SUBLOCATIONS } from "./sublocations";
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
        (c.data.run.flags[TAGS.MODIFIERS.HAS_JUNK_WALLET] ?? null) ? 10 : 0;
      let trendyWalletMod =
        (c.data.run.flags[TAGS.MODIFIERS.HAS_TRENDY_WALLET] ?? null) ? 10 : 0;
      return 10 + junkWalletMod + trendyWalletMod;
    },
  },
  small_battery: {
    name: "Small battery",
    description: "Restores 1 energy when consumed",
    consumable: true,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy < s.data.run.maxEnergy - 1;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 1,
        s.data.run.maxEnergy,
      );
      return s;
    },
    capacity: (_) => 10,
  },
  charged_battery: {
    name: "Charged battery",
    description: "Restores 2 energy on use",
    consumable: true,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy < s.data.run.maxEnergy - 2;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 2,
        s.data.run.maxEnergy,
      );
      return s;
    },
    capacity: (_) => 10,
  },
  all_day_battery: {
    name: "All-day battery",
    description: "Restores 4 energy on use",
    consumable: true,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy < s.data.run.maxEnergy - 4;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 4,
        s.data.run.maxEnergy,
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
  na641_travel_boots: {
    name: "Travel boots",
    description: "Sturdy boots for rough terrain",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_firestarter_set: {
    name: "Firestarter set",
    description: "Portable firestarting tools",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_solar_powered_radio: {
    name: "Solar-powered radio",
    description: "Might be of use?",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_modified_solar_radio: {
    name: "Modified solar-powered radio",
    description: "Can trickle-charge your device in direct sunlight",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_top_level_pass: {
    name: "Arcadia top level pass",
    description: "Grants access to Arcadia's top level",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  new_arcadia_fake_id: {
    name: "New Arcadia fake ID",
    description: "A convincing imitation of New Arcadia identification",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  new_arcadia_id: {
    name: "New Arcadia ID",
    description: "Official New Arcadia identification",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  bbasin7281_weird_skull: {
    name: "Weird skull",
    description: "Removed from the remains at Ashbone Basin",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_clanky_mini_printer: {
    name: "Clanky mini-printer",
    description: "A decommissioned City Hall document printer",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  anchor_ancient_bone: {
    name: "Ancient Bone",
    description: "A museum fossil specimen",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
    anchor: {
      location: LOCATIONS.bbasin7281,
      sublocation: SUBLOCATIONS.bbasin7281.sulfurSprings,
    },
  },
  anchor_broken_temporal_calibrator: {
    name: "Broken temporal calibrator",
    description: "A damaged piece of your lab equipment",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
    anchor: {
      location: LOCATIONS.na641,
      sublocation: SUBLOCATIONS.na641.westernMainStreetAlley,
    },
  },
} as const satisfies Record<string, Item>;

// Step 2: Create a type that extracts the keys
export type ItemKey = keyof typeof items;
