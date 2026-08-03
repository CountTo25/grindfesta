import { LOCATIONS, SUBLOCATIONS } from "../gameData/sublocations";
import type { SaveMigration } from "./types";

export default {
  migration_id: "20260804_pantheon_age_to_eternia",
  renamed_action_ids: [],
  renamed_knowledge_ids: [],
  renamed_locations: [
    {
      old: "Pantheon Age -31349",
      new: LOCATIONS.eternia31349,
    },
  ],
  renamed_sublocations: [
    {
      old: "Pantheon Age -31349 — Great Library",
      new: SUBLOCATIONS.eternia31349.greatLibrary,
    },
  ],
  renamed_item_ids: [],
  renamed_flags: [],
} satisfies SaveMigration;
