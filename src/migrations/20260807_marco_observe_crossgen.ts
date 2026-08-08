import type { SaveMigration } from "./types";

const ACTION_ID = "narcadia_macros_observe_work";

export default {
  migration_id: "20260807_marco_observe_crossgen",
  transform(data) {
    const wasCompleted =
      data.global.completedActionHistory.includes(ACTION_ID) ||
      data.run.actionProgress[ACTION_ID]?.complete;

    if (
      wasCompleted &&
      !data.global.presistentActionProgress.includes(ACTION_ID)
    ) {
      data.global.presistentActionProgress.push(ACTION_ID);
    }
  },
} satisfies SaveMigration;
