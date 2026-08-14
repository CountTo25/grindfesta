import type { SaveMigration } from "./types";

const REMOVED_MILESTONE_ID = "eternia31349_total_magic_show_off";

function withoutRemovedMilestone<T extends { id: string }>(entries: T[]): T[] {
  return entries.filter(({ id }) => id !== REMOVED_MILESTONE_ID);
}

export default {
  migration_id: "20260814_remove_total_magic_show_off_milestone",
  transform(data) {
    data.global.reached_milestones = data.global.reached_milestones.filter(
      (id) => id !== REMOVED_MILESTONE_ID,
    );
    data.run.milestoneEntries = withoutRemovedMilestone(
      data.run.milestoneEntries,
    );
    data.global.last_run_milestone_entries = withoutRemovedMilestone(
      data.global.last_run_milestone_entries,
    );
    data.global.previous_run_milestone_entries = withoutRemovedMilestone(
      data.global.previous_run_milestone_entries,
    );
  },
} satisfies SaveMigration;
