import type { SaveMigration, SaveMigrationData } from "./types";
import migration20260610Wsheath7281ToBbasin7281 from "./20260610_wsheath7281_to_bbasin7281";
import migration20260610143202UpperLayerCityHall from "./20260610_143202_upper_layer_city_hall";
import migration20260803SolarRadioUpgradeFlags from "./20260803_solar_radio_upgrade_flags";
import migration20260804PantheonAgeToEternia from "./20260804_pantheon_age_to_eternia";
import migration20260804EternianBasicSymbolics from "./20260804_eternian_basic_symbolics";
import migration20260804TimeLeapMilestone from "./20260804_time_leap_milestone";
import migration20260805MagicArchivesLocation from "./20260805_magic_archives_location";
import migration20260805SolarRadioChargerFlag from "./20260805_solar_radio_charger_flag";
import migration20260807NamedRetraceConfigs from "./20260807_named_retrace_configs";
import migration20260807MarcoObserveCrossgen from "./20260807_marco_observe_crossgen";
// add-migration-imports-above

const SAVE_MIGRATIONS: SaveMigration[] = [
  migration20260610Wsheath7281ToBbasin7281,
  migration20260610143202UpperLayerCityHall,
  migration20260803SolarRadioUpgradeFlags,
  migration20260804PantheonAgeToEternia,
  migration20260804EternianBasicSymbolics,
  migration20260804TimeLeapMilestone,
  migration20260805MagicArchivesLocation,
  migration20260805SolarRadioChargerFlag,
  migration20260807NamedRetraceConfigs,
  migration20260807MarcoObserveCrossgen,
  // add-migration-entries-above
];

export const LATEST_SAVE_MIGRATION =
  SAVE_MIGRATIONS[SAVE_MIGRATIONS.length - 1]?.migration_id ?? null;

function renameValue(value: string, renames: RenameMap) {
  return renames.get(value) ?? value;
}

function renameUniqueValues(values: string[], renames: RenameMap) {
  return Array.from(
    new Set(values.map((value) => renameValue(value, renames))),
  );
}

function buildRenameMap(
  patches: { old: string; new: string }[] | undefined,
): RenameMap {
  return new Map((patches ?? []).map((patch) => [patch.old, patch.new]));
}

type RenameMap = Map<string, string>;

function renameKeys<T>(
  record: { [id: string]: T | undefined },
  renames: RenameMap,
  merge?: (oldValue: T, existingValue: T) => T,
) {
  for (const [oldId, newId] of renames) {
    const oldValue = record[oldId];
    if (oldValue === undefined) continue;

    const existingValue = record[newId];
    record[newId] =
      existingValue !== undefined && merge
        ? merge(oldValue, existingValue)
        : (existingValue ?? oldValue);
    delete record[oldId];
  }
}

function applyActionRenames(data: SaveMigrationData, migration: SaveMigration) {
  const renames = buildRenameMap(migration.renamed_action_ids);
  if (renames.size === 0) return;

  if (data.run.action) {
    data.run.action.id = renameValue(data.run.action.id, renames);
  }
  if (data.run.activeQueuedAction) {
    data.run.activeQueuedAction.id = renameValue(
      data.run.activeQueuedAction.id,
      renames,
    );
  }
  data.run.actionQueue = data.run.actionQueue.map((action) => ({
    ...action,
    id: renameValue(action.id, renames),
  }));

  renameKeys(data.run.actionProgress, renames);
  data.global.presistentActionProgress = renameUniqueValues(
    data.global.presistentActionProgress,
    renames,
  );
  data.global.completedActionHistory = renameUniqueValues(
    data.global.completedActionHistory,
    renames,
  );
  if (data.global.retraceConfig) {
    data.global.retraceConfig = data.global.retraceConfig.map((action) => ({
      id: renameValue(action.id, renames),
    }));
  }
  data.global.retraceConfigs = (data.global.retraceConfigs ?? []).map(
    (config) => ({
      ...config,
      actions: config.actions.map((action) => ({
        id: renameValue(action.id, renames),
      })),
    }),
  );
}

function applyKnowledgeRenames(
  data: SaveMigrationData,
  migration: SaveMigration,
) {
  const renames = buildRenameMap(migration.renamed_knowledge_ids);
  if (renames.size === 0) return;

  data.global.knowledge = renameUniqueValues(data.global.knowledge, renames);
}

function applyLocationRenames(
  data: SaveMigrationData,
  migration: SaveMigration,
) {
  const locationRenames = buildRenameMap(migration.renamed_locations);
  const sublocationRenames = buildRenameMap(migration.renamed_sublocations);

  data.run.location = renameValue(data.run.location, locationRenames);
  data.run.subLocation = renameValue(data.run.subLocation, sublocationRenames);
}

function applyItemRenames(data: SaveMigrationData, migration: SaveMigration) {
  const renames = buildRenameMap(migration.renamed_item_ids);
  if (renames.size === 0) return;

  renameKeys(data.run.inventory, renames, (oldValue, existingValue) => ({
    amount: oldValue.amount + existingValue.amount,
    cooldown: Math.max(oldValue.cooldown, existingValue.cooldown),
  }));
}

function applyFlagRenames(data: SaveMigrationData, migration: SaveMigration) {
  const renames = buildRenameMap(migration.renamed_flags);
  if (renames.size === 0) return;

  renameKeys(data.run.flags, renames);
}

function applyMigration(data: SaveMigrationData, migration: SaveMigration) {
  applyActionRenames(data, migration);
  applyKnowledgeRenames(data, migration);
  applyLocationRenames(data, migration);
  applyItemRenames(data, migration);
  applyFlagRenames(data, migration);
  migration.transform?.(data);
}

export function applySaveMigrations<T extends SaveMigrationData>(data: T): T {
  const latestAppliedIndex =
    data.latestMigration === null || data.latestMigration === undefined
      ? -1
      : SAVE_MIGRATIONS.findIndex(
          (migration) => migration.migration_id === data.latestMigration,
        );

  for (const migration of SAVE_MIGRATIONS.slice(latestAppliedIndex + 1)) {
    applyMigration(data, migration);
    data.latestMigration = migration.migration_id;
  }

  if (SAVE_MIGRATIONS.length === 0) {
    data.latestMigration = null;
  }

  return data;
}
