import {
  BASE_ACHIEVEMENT_MODIFIERS,
  achievementEntries,
  achievements,
  type Achievement,
  type AchievementEffect,
  type AchievementKey,
} from "../gameData/achievements";
import type { Action, GameState, Location, RunState } from "../types";

function getUnlockedAchievements(state: GameState): Achievement[] {
  return state.data.global.unlocked_achievements.flatMap<Achievement>((id) => {
    const achievement = achievements[id];
    return achievement ? [achievement] : [];
  });
}

export function evaluateRunAchievements(
  state: GameState,
  completedRun: RunState,
  actionDefinitions: Record<string, Action>,
): AchievementKey[] {
  const newlyUnlocked: AchievementKey[] = [];
  const completedActionLocations = getCompletedActionLocations(
    completedRun,
    actionDefinitions,
  );

  for (const [id, achievement] of achievementEntries) {
    if (
      state.data.global.unlocked_achievements.includes(id) ||
      !achievement.unlocksAtRunEnd({
        state,
        completedRun,
        completedActionLocations,
      })
    ) {
      continue;
    }

    state.data.global.unlocked_achievements.push(id);
    newlyUnlocked.push(id);
  }

  completedRun.newlyUnlockedAchievements = newlyUnlocked;
  return newlyUnlocked;
}

function getCompletedActionLocations(
  completedRun: RunState,
  actionDefinitions: Record<string, Action>,
): Location[] {
  const locations = Object.entries(completedRun.actionProgress)
    .filter(([, progress]) => progress.complete)
    .flatMap(([id]) =>
      (actionDefinitions[id]?.conditions ?? []).flatMap((condition) =>
        condition.metadata?.kind === "inLocation"
          ? condition.metadata.locations
          : [],
      ),
    );

  return [...new Set(locations)];
}

export type AchievementEffectPhase = "preRun" | "active";

export function applyAchievementEffects(
  gameData: GameState,
  phase: AchievementEffectPhase,
): GameState {
  return getUnlockedAchievements(gameData)
    .map((achievement) => achievement.achievementEffects[phase])
    .filter((effect): effect is AchievementEffect => effect !== null)
    .reduce((current, effect) => effect(current), gameData);
}

export function applyPreRunAchievementEffects(
  gameData: GameState,
): GameState {
  return applyAchievementEffects(gameData, "preRun");
}

export function applyActiveAchievementEffects(
  gameData: GameState,
): GameState {
  gameData.data.run.achievementModifiers = {
    ...BASE_ACHIEVEMENT_MODIFIERS,
  };
  return applyAchievementEffects(gameData, "active");
}
