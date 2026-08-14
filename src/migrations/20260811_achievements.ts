import type { SaveMigration } from "./types";

const TIMELINE_STABILIZATION_ID = "timeline_stabilization";

export default {
  migration_id: "20260811_achievements",
  transform(data) {
    const unlockedAchievements = (data.global.unlocked_achievements ??= []);
    const ownedLegacyUpgrade = data.global.purchased_upgrades?.includes(
      TIMELINE_STABILIZATION_ID,
    );

    if (
      ownedLegacyUpgrade &&
      !unlockedAchievements.includes(TIMELINE_STABILIZATION_ID)
    ) {
      unlockedAchievements.push(TIMELINE_STABILIZATION_ID);
      data.global.maxEnergy -= data.global.reached_milestones.length;
    }

    delete data.global.purchased_upgrades;
  },
} satisfies SaveMigration;
