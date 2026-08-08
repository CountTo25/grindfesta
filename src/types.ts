import { bakery, type BakedSkills } from "./state";
import { deepClone, mergeDeep } from "./utils";
import { items, type ItemKey } from "./gameData/items";
import type { MilestoneEntry, MilestoneKey } from "./gameData/milestones";
import type { UpgradeKey } from "./gameData/upgrades";
import {
  LOCATIONS,
  SUBLOCATIONS,
  type KnownLocation,
  type KnownSubLocation,
} from "./gameData/sublocations";
import { applySaveMigrations } from "./migrations/migrations";

export const DEFAULT_RETRACE_CONFIG_ID = "default-retrace-config";

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
    magic: 0,
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
    magic: 0,
  },
  milestoneEntries: [{ ts: 0, id: "na641_time_leap" }],
  murmurCooldowns: {},
  logEntries: [],
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
        magic: 0,
      },
      energyDecayRate: 0.1,
      maxEnergy: 10,
      presistentActionProgress: [],
      loop: 0,
      knowledge: [],
      reached_milestones: ["na641_time_leap"],
      purchased_upgrades: [],
      last_run_milestone_entries: [],
      previous_run_milestone_entries: [],
      completedActionHistory: [],
      retraceConfigs: [
        {
          id: DEFAULT_RETRACE_CONFIG_ID,
          name: "Default",
          actions: [],
        },
      ],
      activeRetraceConfigId: DEFAULT_RETRACE_CONFIG_ID,
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
  | "survival"
  | "magic";
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

export type RetraceAction = { id: string };

export type RetraceConfig = {
  id: string;
  name: string;
  actions: RetraceAction[];
};

type GlobalState =
  | {
      stats: SkillLevels;
      presistentActionProgress: string[];
      loop: number;
      knowledge: string[];
      reached_milestones: MilestoneKey[];
      purchased_upgrades: UpgradeKey[];
      last_run_milestone_entries: MilestoneEntry[];
      previous_run_milestone_entries: MilestoneEntry[];
      completedActionHistory: string[];
      retraceConfigs: RetraceConfig[];
      activeRetraceConfigId: string | null;
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
      milestoneEntries: MilestoneEntry[];
      murmurCooldowns: { [location: string]: number };
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

export type StatePatcherMetadata = {
  kind: "moveSubLocation";
  destination: SubLocation;
};

export type StatePatcher = ((state: GameState) => GameState) & {
  metadata?: StatePatcherMetadata;
};
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
  cooldownMs?: number;
  onConsume: StatePatcher[] | StatePatcher;
  consumeRequirement: StateChecker | StateChecker[];
  capacity: ((d: GameState) => number) | null;
  anchor?: {
    location: Location;
    sublocation: SubLocation;
  };
};
