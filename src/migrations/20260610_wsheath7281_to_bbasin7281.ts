import { LOCATIONS, SUBLOCATIONS } from "../gameData/sublocations";
import type { SaveMigration } from "./types";

export default {
  migration_id: "2026-06-10_wsheath7281_to_bbasin7281",
  renamed_action_ids: [
    {
      old: "wsheath7281_investigate_surroundings",
      new: "bbasin7281_investigate_surroundings",
    },
    {
      old: "wsheath7281_inspect_remains",
      new: "bbasin7281_inspect_remains",
    },
    {
      old: "wsheath7281_move_to_canyon",
      new: "bbasin7281_move_to_canyon",
    },
    {
      old: "wsheath7281_fend_off_lizard",
      new: "bbasin7281_fend_off_lizard",
    },
  ],
  renamed_knowledge_ids: [
    {
      old: "wsheath7281_fossil_origins",
      new: "bbasin7281_fossil_origins",
    },
  ],
  renamed_locations: [
    {
      old: "Windswept Heath -7281",
      new: LOCATIONS.bbasin7281,
    },
  ],
  renamed_sublocations: [
    {
      old: "Windswept Heath -7281 — Lush forest",
      new: SUBLOCATIONS.bbasin7281.sulfurSprings,
    },
    {
      old: "Windswept Heath -7281 — Sulfur springs",
      new: SUBLOCATIONS.bbasin7281.sulfurSprings,
    },
    {
      old: "Windswept Heath -7281 — Canyon",
      new: SUBLOCATIONS.bbasin7281.canyon,
    },
  ],
  renamed_item_ids: [],
  renamed_flags: [],
} satisfies SaveMigration;
