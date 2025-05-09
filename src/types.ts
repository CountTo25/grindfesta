import { deepClone } from "./utils";

export const EMPTY_RUN: RunState = {
  maxEnergy: 10,
  energyDecayRate: 0.1,
  action: null,
  actionProgress: {},
  mainViewRoute: "actions",
  timeSpent: 0.0,
  currentEnergy: 10.0,
  location: "New Arcadia 641",
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
    },
    run: { ...deepClone(EMPTY_RUN) },
  };

  static new(): GameState {
    //try to re-hydrate or drop new one
    return new GameState();
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
  | "Macro's Workshop";

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
    } & EnergyData;

export type RunState =
  | {
      mainViewRoute: "actions";
      action: CurrentAction | null;
      logEntries: LogEntry[];
      actionProgress: { [id: string]: { progress: number; complete: boolean } };
      timeSpent: number;
      stats: SkillLevels;
      maxEnergy: number;
      energyDecayRate: number;
      currentEnergy: number;
      location: Location;
      subLocation: SubLocation;
    } & EnergyData;

export type LogEntry = { ts: number; text: string };

type StatePatcher = (f: GameState) => GameState;
export type Action = {
  title: string | ((state: GameState) => string);
  skill: Skill;
  weight: number;
  conditions: ((state: GameState) => boolean)[];
  repeatable: boolean;
  crossGeneration: boolean;
  postComplete: StatePatcher | StatePatcher[];
  flavourText?: string;
  stopOnRepeat?: boolean;
};
