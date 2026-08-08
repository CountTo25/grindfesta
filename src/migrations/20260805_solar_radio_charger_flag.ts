import type { SaveMigration } from "./types";

const MODIFY_ACTION_ID = "na641_marcos_modify_solar_radio";
const CHARGER_FLAG = "na641_solar_radio_charger_modified";

export default {
  migration_id: "20260805_solar_radio_charger_flag",
  transform(data) {
    if (data.run.actionProgress[MODIFY_ACTION_ID]?.complete) {
      data.run.flags[CHARGER_FLAG] = "1";
    }
  },
} satisfies SaveMigration;
