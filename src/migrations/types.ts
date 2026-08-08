type RenamePatch = {
  old: string;
  new: string;
};

export type SaveMigrationData = {
  latestMigration?: string | null;
  run: {
    action: { id: string } | null;
    actionQueue: {
      id: string;
      mode: "once" | "max";
      source?: "manual" | "retrace";
    }[];
    activeQueuedAction: {
      id: string;
      mode: "once" | "max";
      source?: "manual" | "retrace";
    } | null;
    actionProgress: {
      [id: string]: { progress: number; complete: boolean };
    };
    flags: { [id: string]: string | null };
    inventory: {
      [id: string]: { amount: number; cooldown: number } | undefined;
    };
    logEntries: { ts: number; text: string }[];
    milestoneEntries: { ts: number; id: string }[];
    murmurCooldowns: { [location: string]: number };
    location: string;
    subLocation: string;
  };
  global: {
    presistentActionProgress: string[];
    completedActionHistory: string[];
    retraceConfig?: { id: string }[];
    retraceConfigs: {
      id: string;
      name: string;
      actions: { id: string }[];
    }[];
    activeRetraceConfigId: string | null;
    knowledge: string[];
    reached_milestones: string[];
    purchased_upgrades: string[];
    last_run_milestone_entries: { ts: number; id: string }[];
    previous_run_milestone_entries: { ts: number; id: string }[];
  };
};

export type SaveMigration = {
  migration_id: string;
  renamed_action_ids?: RenamePatch[];
  renamed_knowledge_ids?: RenamePatch[];
  renamed_locations?: RenamePatch[];
  renamed_sublocations?: RenamePatch[];
  renamed_item_ids?: RenamePatch[];
  renamed_flags?: RenamePatch[];
  transform?: (data: SaveMigrationData) => void;
};
