export class GameState {
  data: GameStateInner = {
    action: null,
    mainViewRoute: "actions",
    logEntries: [
      {
        ts: 0,
        text: "After series of weird zaps, your time leap machine seemingly started to work. Then the second series of zaps came in. You find yourself transported to some weird backalley",
      },
    ],
  };

  static new(): GameState {
    //try to re-hydrate or drop new one
    return new GameState();
  }
}

export type CurrentAction = {
  id: string;
  progress: number;
};

type GameStateInner = {
  mainViewRoute: "actions";
  action: CurrentAction | null;
  logEntries: { ts: number; text: string }[];
};

type StatePatcher = (f: GameStateInner) => GameStateInner;
export type Skill = "exploration" | "perception";
export type Action = {
  title: string;
  skill: Skill;
  weight: number;
  conditions: ((state: GameState) => boolean)[];
  repeatable: boolean;
  crossGeneration: boolean;
  postComplete: StatePatcher | null;
};
