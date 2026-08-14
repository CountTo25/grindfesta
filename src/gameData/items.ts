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
        (c.data.run.flags[TAGS.MODIFIERS.HAS_TRENDY_WALLET] ?? null) ? 15 : 0;
      let handcraftedWalletMod =
        (c.data.run.flags[TAGS.MODIFIERS.HAS_HANDCRAFTED_WALLET] ?? null)
          ? 10
          : 0;
      return 10 + junkWalletMod + trendyWalletMod + handcraftedWalletMod;
    },
  },
  eternia31349_gald: {
    name: "Gald",
    description: "Currency of Eternia",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: null,
  },
  small_battery: {
    name: "Small battery",
    description: "Restores 1 energy when consumed",
    consumable: true,
    cooldownMs: 5000,
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
    cooldownMs: 5000,
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
    cooldownMs: 5000,
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
  bbasin7281_lizard_photo: {
    name: "Photo of the huge lizard",
    description: "Proof of the creature in Ashbone Basin",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
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
  na641_pocket_light: {
    name: "Pocket light",
    description: "A compact light that works for a day",
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
  na641_top_level_pass: {
    name: "Arcadia top level pass",
    description: "Grants access to Arcadia's top level",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  new_arcadia_fake_id: {
    name: "Fake New Arcadia ID",
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
  bbasin7281_rough_aurexite_chunk: {
    name: "Rough Aurexite chunk",
    description: "A low-quality piece of surface Aurexite",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 3,
  },
  na641_passive_energy_generator: {
    name: "Passive energy generator",
    description: "Restores 0.5 energy every 20 seconds",
    consumable: true,
    cooldownMs: 20000,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy < s.data.run.maxEnergy;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 0.5,
        s.data.run.maxEnergy,
      );
      s.data.run.inventory.na641_passive_energy_generator!.amount += 1;
      return s;
    },
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
  na641_to_be_compromised_package: {
    name: "To-be-compromised package",
    description: "Johnny's special delivery package",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_johnnys_special_envelope: {
    name: "Special envelope",
    description: "A special envelope from Johnny",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_compromised_package: {
    name: "Compromised package",
    description:
      "Johnny's envelope is hidden inside. Target is in Southern Main Street",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_johnny_information_report: {
    name: "Compiled information report",
    description: "Information gathered for Johnny's gang",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_blank_id_shipment: {
    name: "Pack of blank IDs",
    description: "A pack of blank New Arcadia ID cards",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  na641_blank_id: {
    name: "Blank ID",
    description: "A single blank New Arcadia ID card",
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
  anchor_aurexite_tome: {
    name: "Aurexite tome",
    description: "An archaic tome on loan from the Master Librarian",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
    anchor: {
      location: LOCATIONS.eternia31349,
      sublocation: SUBLOCATIONS.eternia31349.greatLibrary,
    },
  },
  anchor_god_of_knowledge_book: {
    name: "God of Knowledge's book",
    description: "A children's book preserved through time",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
    anchor: {
      location: LOCATIONS.eterniaSilent29624,
      sublocation: SUBLOCATIONS.eterniaSilent29624.vault,
    },
  },
  eternia31349_aurexite_beads: {
    name: "Aurexite beads",
    description: "Well, thats just aurexite",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 1,
  },
  eternia31349_spare_aurexite_bead: {
    name: "Spare Aurexite bead",
    description: "Well, its just aurexite. But in bead form!",
    consumable: false,
    consumeRequirement: [],
    onConsume: [],
    capacity: (_) => 5,
  },
  pure_energy: {
    name: "Pure energy",
    description: "Energy is circling your device, waiting for the chance to enter",
    consumable: true,
    cooldownMs: 5000,
    consumeRequirement: (s) => {
      return s.data.run.currentEnergy <= s.data.run.maxEnergy - 1;
    },
    onConsume: (s: GameState) => {
      s.data.run.currentEnergy = Math.min(
        s.data.run.currentEnergy + 1,
        s.data.run.maxEnergy,
      );
      return s;
    },
    capacity: null,
  },
} as const satisfies Record<string, Item>;

// Step 2: Create a type that extracts the keys
export type ItemKey = keyof typeof items;

export function getItemCooldown(id: ItemKey): number {
  const item = items[id];
  return "cooldownMs" in item ? item.cooldownMs : 5000;
}

export function getItemCapacity(
  id: ItemKey,
  state: GameState,
): number | null {
  const capacity = items[id].capacity;
  return capacity === null ? null : capacity(state);
}
