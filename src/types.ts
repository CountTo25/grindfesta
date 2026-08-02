import { bakery, type BakedSkills } from "./state";
import { deepClone, mergeDeep } from "./utils";
import { items, type ItemKey } from "./gameData/items";
import {
  LOCATIONS,
  SUBLOCATIONS,
  type KnownLocation,
  type KnownSubLocation,
} from "./gameData/sublocations";
import { applySaveMigrations } from "./migrations/migrations";

export const EMPTY_RUN: RunState = {
  retraceIdx: null,
  actionQueue: [],
  activeQueuedAction: null,
  maxEnergy: 10,
  energyDecayRate: 0.05,
  action: null,
  actionProgress: {},
  flags: {},
  mainViewRoute: "actions",
  timeSpent: 0.0,
  currentEnergy: 10.0,
  location: LOCATIONS.na641,
  inventory: {},
  initialStats: {
    exploration: 0,
    perception: 0,
    social: 0,
    engineering: 0,
    survival: 0,
  },
  // Deprecated
  inventoryCapacity: 10,
  subLocation: SUBLOCATIONS.na641.westernMainStreetAlley,
  stats: {
    exploration: 0,
    perception: 0,
    social: 0,
    engineering: 0,
    survival: 0,
  },
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
    latestMigration: null,
    global: {
      stats: {
        exploration: 0,
        perception: 0,
        social: 0,
        engineering: 0,
        survival: 0,
      },
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
    applySaveMigrations(gs.data);
    return gs;
  }
}

export type CurrentAction = {
  id: string;
};

export type QueuedActionMode = "once" | "max";

export type QueuedAction = {
  id: string;
  mode: QueuedActionMode;
  source?: "manual" | "retrace";
};

export type Skill =
  | "exploration"
  | "perception"
  | "social"
  | "engineering"
  | "survival";
export type Location = KnownLocation;
export type SubLocation = KnownSubLocation;
export type NewArcadiaSubLocation = KnownSubLocation;

export type SkillLevels = {
  [k in Skill]: number;
};
type GameStateInner = {
  latestMigration: string | null;
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

export type MainViewRoute = "actions" | "endRun" | "retracing";

export type RunState =
  | {
      retraceIdx: number | null;
      actionQueue: QueuedAction[];
      activeQueuedAction: QueuedAction | null;
      mainViewRoute: MainViewRoute;
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
export type ActionText = string | ((state: GameState) => string);
export type Action = {
  title: ActionText;
  skill: Skill;
  weight: number;
  idx?: number;
  conditions: ((state: GameState) => boolean)[];
  repeatable: boolean;
  crossGeneration: boolean;
  revealCondition?: ((state: GameState) => boolean)[];
  revealConditionExplained?: ActionText[];
  postComplete: StatePatcher | StatePatcher[];
  flavourText?: ActionText;
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
  anchor?: {
    location: Location;
    sublocation: SubLocation;
  };
};
