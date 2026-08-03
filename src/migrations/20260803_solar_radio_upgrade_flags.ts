import type { SaveMigration } from "./types";

export default {
  migration_id: "20260803_solar_radio_upgrade_flags",
  renamed_action_ids: [],
  renamed_knowledge_ids: [],
  renamed_locations: [],
  renamed_sublocations: [],
  renamed_item_ids: [
    {
      old: "na641_modified_solar_radio",
      new: "na641_solar_powered_radio",
    },
  ],
  renamed_flags: [],
} satisfies SaveMigration;
