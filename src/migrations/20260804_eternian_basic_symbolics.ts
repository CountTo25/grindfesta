import type { SaveMigration } from "./types";

export default {
  migration_id: "20260804_eternian_basic_symbolics",
  renamed_action_ids: [],
  renamed_knowledge_ids: [
    {
      old: "eternian_language_tome_reading",
      new: "eternian_basic_symbolics",
    },
  ],
  renamed_locations: [],
  renamed_sublocations: [],
  renamed_item_ids: [],
  renamed_flags: [],
} satisfies SaveMigration;
