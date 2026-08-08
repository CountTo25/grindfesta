import type { SaveMigration } from "./types";

const MILESTONE_ID = "na641_time_leap";
const REPLACED_LOGS = new Set([
  "After series of weird zaps, your time leap machine seemingly started to work. Then the second series of zaps came in",
  "You find yourself transported to some backalley",
]);

export default {
  migration_id: "20260804_time_leap_milestone",
  transform(data) {
    data.run.logEntries = data.run.logEntries.filter(
      ({ ts, text }) => ts !== 0 || !REPLACED_LOGS.has(text),
    );

    if (!data.run.milestoneEntries.some(({ id }) => id === MILESTONE_ID)) {
      data.run.milestoneEntries.unshift({ ts: 0, id: MILESTONE_ID });
    }
    if (!data.global.reached_milestones.includes(MILESTONE_ID)) {
      data.global.reached_milestones.push(MILESTONE_ID);
    }
  },
} satisfies SaveMigration;
