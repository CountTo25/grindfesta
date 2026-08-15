import type { SaveMigration } from "./types";

const LOOK_AT_TOMES_ACTION_ID = "pantheon31349_look_at_tomes";
const LOOK_AT_TOMES_KNOWLEDGE_IDS = [
  "eternian_basic_symbolics",
  "pantheon31349_great_library_book_assortment",
];

export default {
  migration_id: "20260815_look_at_tomes_knowledge",
  transform(data) {
    if (
      !data.global.presistentActionProgress.includes(LOOK_AT_TOMES_ACTION_ID)
    ) {
      return;
    }

    for (const knowledgeId of LOOK_AT_TOMES_KNOWLEDGE_IDS) {
      if (!data.global.knowledge.includes(knowledgeId)) {
        data.global.knowledge.push(knowledgeId);
      }
    }
  },
} satisfies SaveMigration;
