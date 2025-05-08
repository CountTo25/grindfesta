import { sendKnowledgesignal } from "./state";
import type {
  GameState,
  Location,
  LogEntry,
  RunState,
  SubLocation,
} from "./types";

export const syncToDebug = (tag: string) => {
  //@ts-ignore
  !window.__debug && (window.__debug = {});
  return (value: any) => {
    console.log("synced to debug", value, tag);
    //@ts-ignore
    window.__debug[tag] = value;
  };
};

export function deepMerge<T>(target: T, source: Partial<T>) {
  const result = { ...target, ...source };
  for (const key of Object.keys(result)) {
    //@ts-ignore
    result[key] =
      //@ts-ignore
      typeof target[key] == "object" && typeof source[key] == "object"
        ? //@ts-ignore
          deepMerge(target[key], source[key])
        : //@ts-ignore
          structuredClone(result[key]);
  }
  return result;
}

export const withLogEntry = (text: string) => {
  return (d: GameState) => {
    d.data.run.logEntries.push({ ts: d.data.run.timeSpent, text });
    return d;
  };
};

type GenericConditionCheck = (d: GameState) => boolean;
export const CONDITION_CHECKS = {
  or: (conditions: GenericConditionCheck[]): GenericConditionCheck => {
    return (d: GameState): boolean => {
      return conditions.some((v) => v(d));
    };
  },
  inLocation: (locations: Location | Location[]): GenericConditionCheck => {
    let all = Array.isArray(locations) ? locations : [locations];
    return (d: GameState): boolean => all.includes(d.data.run.location);
  },
  inSubLocation: (location: SubLocation): GenericConditionCheck => {
    return (d: GameState): boolean => d.data.run.subLocation === location;
  },
  not: (
    conditions: GenericConditionCheck[] | GenericConditionCheck
  ): GenericConditionCheck => {
    let allConditions = Array.isArray(conditions) ? conditions : [conditions];
    return (d: GameState): boolean => {
      return allConditions.every((v) => !v(d));
    };
  },
  ifActionCompleteRun: (actions: string | string[]) => {
    return (d: GameState): boolean => {
      actions = Array.isArray(actions) ? actions : [actions];
      return actions.every(
        (id) =>
          d.data.run.actionProgress[id] &&
          d.data.run.actionProgress[id]!.complete
      );
    };
  },
  ifActionCompleteAny: (actions: string | string[]) => {
    return (d: GameState): boolean => {
      actions = Array.isArray(actions) ? actions : [actions];
      return actions.every(
        (id) =>
          (d.data.run.actionProgress[id] &&
            d.data.run.actionProgress[id]!.complete) ||
          d.data.global.presistentActionProgress.includes(id)
      );
    };
  },
  ifActionCompleteGlobal: (
    actions: string | string[]
  ): GenericConditionCheck => {
    return (d: GameState): boolean => {
      actions = Array.isArray(actions) ? actions : [actions];
      return actions.every(
        (id) =>
          d.data.global.presistentActionProgress.includes(id) &&
          (!d.data.run.actionProgress[id] ||
            !d.data.run.actionProgress[id].complete)
      );
    };
  },
};

export const COMPLETION_EFFECTS = {
  addLog: (text: string) => {
    return (d: GameState) => {
      d.data.run.logEntries.push({ ts: d.data.run.timeSpent, text });
      return d;
    };
  },
  moveSubLocation: (location: SubLocation) => {
    return (d: GameState) => {
      d.data.run.subLocation = location;
      return d;
    };
  },
  addKnowledge: (id: string) => {
    return (d: GameState) => {
      if (!d.data.global.knowledge.includes(id)) {
        d.data.global.knowledge.push(id);
        sendKnowledgesignal();
      }
      return d;
    };
  },
};

export const LOCATION_CHECKS: {
  [k in Location]: (d: GameState) => { text: string | null; show: boolean };
} = {
  "New Arcadia 641": (d: GameState) => {
    //TODO research any way to get rust-like match
    let text = null;
    if (d.data.global.knowledge.includes("new_arcadia_town_name")) {
      text = "New Arcadia";
    }
    if (d.data.global.knowledge.includes("new_arcadia_year")) {
      if (!text) {
        text = "641";
      } else {
        text += " 641";
      }
    }
    return { text, show: text != null };
  },
};

export function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

//todo: refactor this bs
export function expToLevel(
  exp: number,
  baseExp: number
): { level: number; expToNext: number; expToCurrent: number } {
  let level = 1;
  let requiredExp = baseExp;
  let expToCurrent = 0;

  while (exp >= requiredExp) {
    exp -= requiredExp;
    expToCurrent += requiredExp;
    level++;
    requiredExp = Math.floor(requiredExp * 1.2);
  }

  return {
    level,
    expToNext: requiredExp,
    expToCurrent,
  };
}

export function getModifier(level: number, power: number) {
  const raw = Math.pow(power, level - 1);
  return Math.round(raw * 10000) / 10000;
}

export const processCleanGameState = (gs: RunState): RunState => deepClone(gs);

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const cloned: any = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      cloned[key] = deepClone((obj as any)[key]);
    }
  }

  return cloned;
}
