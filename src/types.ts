import { bakery, type BakedSkills } from "./state";
import { deepClone, mergeDeep } from "./utils";
import { items, type ItemKey } from "./gameData/items";

export const EMPTY_RUN: RunState = {
  retraceIdx: 0,
  maxEnergy: 10,
  energyDecayRate: 0.05,
  action: null,
  actionProgress: {},
  flags: {},
  mainViewRoute: "actions",
  timeSpent: 0.0,
  currentEnergy: 10.0,
  location: "New Arcadia 641",
  inventory: {},
  initialStats: { exploration: 0, perception: 0, social: 0, engineering: 0 },
  // Deprecated
  inventoryCapacity: 10,
  subLocation: "Western main street alley",
  stats: { exploration: 0, perception: 0, social: 0, engineering: 0 },
  logEntries: [
    {
      ts: 0,
      text: "After series of weird zaps, your time leap machine seemingly started to work. Then the second series of zaps came in",
    },
    {
      ts: 0,
      text: "You find yourself transported to some backalley",
    },
  ],
};

export class GameState {
  data: GameStateInner = {
    global: {
      stats: { exploration: 0, perception: 0, social: 0, engineering: 0 },
      energyDecayRate: 0.1,
      maxEnergy: 10,
      presistentActionProgress: [],
      loop: 0,
      knowledge: [],
      completedActionHistory: [],
      retraceConfig: [],
    },
    run: { ...deepClone(EMPTY_RUN) },
  };

  static new(): GameState {
    //try to re-hydrate or drop new one
    let saved = localStorage.getItem("save_0") as string | undefined;
    let gs = new GameState();
    if (saved) {
      gs.data = mergeDeep(gs.data, JSON.parse(saved));
    }
    return gs;
  }
}

export type CurrentAction = {
  id: string;
};

export type Skill = "exploration" | "perception" | "social" | "engineering";
export type Location = "New Arcadia 641";
export type SubLocation = NewArcadiaSubLocation;
export type NewArcadiaSubLocation =
  | "Western main street alley"
  | "Western main street"
  | "Marco's Workshop"
  | "NAWS History Museum"
  | "NAWS History Museum — Main Hall"
  | "Rapid Delivery Service"
  | "Southern main street outskirts"
  | "Anna's Recycled Goods"
  | "Southern main street";

export type SkillLevels = {
  [k in Skill]: number;
};
type GameStateInner = {
  run: RunState;
  global: GlobalState;
};

type EnergyData = {
  maxEnergy: number;
  energyDecayRate: number;
};

type GlobalState =
  | {
      stats: SkillLevels;
      presistentActionProgress: string[];
      loop: number;
      knowledge: string[];
      completedActionHistory: string[];
      retraceConfig: { id: string }[];
    } & EnergyData;

export type RunState =
  | {
      retraceIdx: number | null;
      mainViewRoute: "actions";
      action: CurrentAction | null;
      logEntries: LogEntry[];
      actionProgress: { [id: string]: { progress: number; complete: boolean } };
      timeSpent: number;
      stats: SkillLevels;
      initialStats: SkillLevels;
      maxEnergy: number;
      flags: { [key: string]: string | null };
      energyDecayRate: number;
      currentEnergy: number;
      location: Location;
      subLocation: SubLocation;
      inventory: { [key in ItemKey]?: { amount: number; cooldown: number } };
      inventoryCapacity: number;
      bakery?: BakedSkills;
    } & EnergyData;

export type LogEntry = { ts: number; text: string };

type StatePatcher = (f: GameState) => GameState;
type StateChecker = (state: GameState) => boolean;
export type Action = {
  title: string | ((state: GameState) => string);
  skill: Skill;
  weight: number;
  idx?: number;
  ignoresStaticLock?: boolean;
  conditions: ((state: GameState) => boolean)[];
  repeatable: boolean;
  crossGeneration: boolean;
  revealCondition?: ((state: GameState) => boolean)[];
  revealConditionExplained?: string[];
  postComplete: StatePatcher | StatePatcher[];
  flavourText?: string;
  stopOnRepeat?: boolean;
  grants?: ItemKey[];
};

export type Item = {
  name: String;
  description: String;
  consumable: boolean;
  onConsume: StatePatcher[] | StatePatcher;
  consumeRequirement: StateChecker | StateChecker[];
  capacity: (d: GameState) => number;
};
