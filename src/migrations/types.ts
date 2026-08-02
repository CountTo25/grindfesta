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
    location: string;
    subLocation: string;
  };
  global: {
    presistentActionProgress: string[];
    completedActionHistory: string[];
    retraceConfig: { id: string }[];
    knowledge: string[];
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
};
