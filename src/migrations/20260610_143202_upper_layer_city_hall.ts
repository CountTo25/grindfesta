import type { SaveMigration } from "./types";

export default {
  migration_id: "20260610_143202_upper_layer_city_hall",
  renamed_action_ids: [
    {
      old: "na641_southern_main_street_visit_city_hall",
      new: "na641_upper_layer_visit_city_hall",
    },
    {
      old: "na641_southern_main_street_leave_city_hall",
      new: "na641_upper_layer_leave_city_hall",
    },
  ],
  renamed_knowledge_ids: [
    {
      old: "na641_southern_main_street_city_hall",
      new: "na641_upper_layer_city_hall",
    },
  ],
  renamed_locations: [],
  renamed_sublocations: [
    {
      old: "Southern main street — City Hall",
      new: "Upper layer — City Hall",
    },
  ],
  renamed_item_ids: [],
  renamed_flags: [],
} satisfies SaveMigration;
