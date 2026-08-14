import type { GameState, Location, RunState } from "../types";

export const BASE_ACHIEVEMENT_MODIFIERS = {
  retracingSpeed: 1,
};

export type AchievementModifiers = typeof BASE_ACHIEVEMENT_MODIFIERS;
export type AchievementEffect = (gameData: GameState) => GameState;
export type AchievementEffects = {
  preRun: AchievementEffect | null;
  active: AchievementEffect | null;
};

export type Achievement = {
  title: string;
  description: string;
  unlocksAtRunEnd: (context: RunAchievementContext) => boolean;
  achievementEffects: AchievementEffects;
};

export type RunAchievementContext = {
  state: GameState;
  completedRun: RunState;
  completedActionLocations: Location[];
};

export const achievements = {
  timeline_stabilization: {
    title: "Timeline stabilization",
    description:
      "You're getting comfortable at this. Increase energy capacity by 1 per discovered milestone",
    unlocksAtRunEnd: ({ state }) => state.data.global.loop >= 5,
    achievementEffects: {
      preRun: (gameData) => {
        const capacityGain =
          gameData.data.global.reached_milestones.length;
        gameData.data.run.maxEnergy += capacityGain;
        gameData.data.run.currentEnergy += capacityGain;
        return gameData;
      },
      active: null,
    },
  },
  three_eras_one_run: {
    title: "Explorer",
    description:
      "Visit 3 distinct eras in one run. Increases speed during retracing by 1.1x",
    unlocksAtRunEnd: ({ completedActionLocations }) =>
      completedActionLocations.length >= 3,
    achievementEffects: {
      preRun: null,
      active: (gameData) => {
        gameData.data.run.achievementModifiers.retracingSpeed *= 1.1;
        return gameData;
      },
    },
  },
} as const satisfies Record<string, Achievement>;

export type AchievementKey = keyof typeof achievements;

export const achievementEntries = Object.entries(achievements) as [
  AchievementKey,
  Achievement,
][];
