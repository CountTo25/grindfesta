import type { SaveMigration } from "./types";

const MIGRATED_CONFIG_ID = "migrated-retrace-config";

export default {
  migration_id: "20260807_named_retrace_configs",
  transform(data) {
    const legacyActions = data.global.retraceConfig ?? [];
    const configs = (data.global.retraceConfigs ??= []);

    if (configs.length === 0 && legacyActions.length > 0) {
      configs.push({
        id: MIGRATED_CONFIG_ID,
        name: "Default plan",
        actions: legacyActions,
      });
    }

    if (
      !configs.some(({ id }) => id === data.global.activeRetraceConfigId)
    ) {
      data.global.activeRetraceConfigId = configs[0]?.id ?? null;
    }

    delete data.global.retraceConfig;
  },
} satisfies SaveMigration;
