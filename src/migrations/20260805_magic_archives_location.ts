import type { SaveMigration } from "./types";

const GUIDANCE_ACTION_ID = "eternia31349_library_ask_hsak_for_guidance";
const ARCHIVES_KNOWLEDGE_ID = "magic_archives_location";

export default {
  migration_id: "20260805_magic_archives_location",
  transform(data) {
    const completedGuidance =
      data.global.presistentActionProgress.includes(GUIDANCE_ACTION_ID) ||
      data.global.completedActionHistory.includes(GUIDANCE_ACTION_ID);

    if (
      completedGuidance &&
      !data.global.knowledge.includes(ARCHIVES_KNOWLEDGE_ID)
    ) {
      data.global.knowledge.push(ARCHIVES_KNOWLEDGE_ID);
    }
  },
} satisfies SaveMigration;
