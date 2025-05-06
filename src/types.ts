export class GameState {
  data: GameStateInner = {
    global: {
      stats: { exploration: 0, perception: 0 },
    },
    run: {
      action: null,
      actionProgress: {},
      mainViewRoute: "actions",
      timeSpent: 0.0,
      stats: { exploration: 0, perception: 0 },
      logEntries: [
        {
          ts: 0,
          text: "After series of weird zaps, your time leap machine seemingly started to work. Then the second series of zaps came in",
        },
        {
          ts: 0,
          text: "You find yourself transported to some weird backalley",
        },
      ],
    },
  };

  static new(): GameState {
    //try to re-hydrate or drop new one
    return new GameState();
  }
}

export type CurrentAction = {
  id: string;
};

export type Skill = "exploration" | "perception";

type SkillLevels = {
  [k in Skill]: number;
};
type GameStateInner = {
  run: RunState;
  global: GlobalState;
};

type GlobalState = {
  stats: SkillLevels;
};

type RunState = {
  mainViewRoute: "actions";
  action: CurrentAction | null;
  logEntries: LogEntry[];
  actionProgress: { [id: string]: { progress: number; complete: boolean } };
  timeSpent: number;
  stats: SkillLevels;
};

export type LogEntry = { ts: number; text: string };

type StatePatcher = (f: GameState) => GameState;
export type Action = {
  title: string | ((state: GameState) => string);
  skill: Skill;
  weight: number;
  conditions: ((state: GameState) => boolean)[];
  repeatable: boolean;
  crossGeneration: boolean;
  postComplete: StatePatcher | null;
};
