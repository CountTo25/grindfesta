import { items, type ItemKey } from "./gameData/items";
import { knowledge } from "./gameData/knowledge";
import {
  sendBakeSignal,
  sendKnowledgesignal,
  sendSubLocationSignal,
} from "./state";
import type {
  GameState,
  Location,
  LogEntry,
  RunState,
  Skill,
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

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
export function mergeDeep<T extends Object>(...objects: T[]): T {
  const isObject = (obj: any) => obj && typeof obj === "object";
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      //@ts-ignore
      const pVal = prev[key];
      //@ts-ignore
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        //@ts-ignore
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        //@ts-ignore
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        //@ts-ignore
        prev[key] = oVal;
      }
    });

    return prev;
  }, {}) as T;
}

export const withLogEntry = (text: string) => {
  return (d: GameState) => {
    d.data.run.logEntries.push({ ts: d.data.run.timeSpent, text });
    return d;
  };
};

type RevealCondition = {
  revealCondition: ((state: GameState) => boolean)[];
  revealConditionExplained: string[];
};

export const REVEAL = {
  skillCheck: (t: Skill, modifier: number): RevealCondition => {
    return {
      revealCondition: [
        (state: GameState) => {
          if (!state.data.run.bakery) sendBakeSignal();
          return (state.data.run.bakery?.modifiers.total[t] ?? 0) >= modifier;
        },
      ],
      revealConditionExplained: [`Requires x${modifier} on ${t}`],
    };
  },

  hasKnowledge: (t: string): RevealCondition => {
    return {
      revealCondition: [(state) => state.data.global.knowledge.includes(t)],
      //@ts-ignore
      revealConditionExplained: [`Requires knowledge about ${knowledge[t]}`],
    };
  },
  itemNotCappedYet: (id: ItemKey): RevealCondition => {
    return {
      revealCondition: [
        (state: GameState) => {
          return (
            (state.data.run.inventory[id]?.amount ?? 0) <
            items[id].capacity(state)
          );
        },
      ],
      revealConditionExplained: [`Needs inventory space for ${items[id].name}`],
    };
  },
  item: (
    id: ItemKey,
    amount: number
  ): {
    revealCondition: ((state: GameState) => boolean)[];
    revealConditionExplained: string[];
  } => {
    return {
      revealCondition: [
        (state: GameState) => {
          return (state.data.run.inventory[id]?.amount ?? 0) >= amount;
        },
      ],
      revealConditionExplained: [`Requires ${amount} of ${items[id].name}`],
    };
  },

  all: (r: RevealCondition[]): RevealCondition => {
    let revealCondition = r.map((v) => v.revealCondition).flat();
    let revealConditionExplained = r
      .map((v) => v.revealConditionExplained)
      .flat();
    return {
      revealCondition,
      revealConditionExplained,
    };
  },
};

type GenericConditionCheck = (d: GameState) => boolean;
export const CONDITION_CHECKS = {
  or: (conditions: GenericConditionCheck[]): GenericConditionCheck => {
    return (d: GameState): boolean => {
      return conditions.some((v) => v(d));
    };
  },

  flag: (
    key: string,
    check: (value: string) => boolean = (_) => true
  ): GenericConditionCheck => {
    return (d: GameState): boolean => {
      let value = d.data.run.flags[key] ?? null;
      if (value === null) return false;
      return check(value);
    };
  },
  numFlagGTE: (key: string, target: number): GenericConditionCheck => {
    return (d: GameState): boolean => {
      let value = d.data.run.flags[key] ?? null;
      if (value === null) return false;
      let numValue = Number.parseInt(value);
      return numValue >= target;
    };
  },
  numFlagLTE: (key: string, target: number): GenericConditionCheck => {
    return (d: GameState): boolean => {
      let value = d.data.run.flags[key] ?? "0";
      let numValue = Number.parseInt(value);
      return numValue <= target;
    };
  },
  hasItem: (key: ItemKey, amount: number = 1): GenericConditionCheck => {
    return (d: GameState): boolean => {
      return (d.data.run.inventory[key] ?? { amount: 0 }).amount >= amount;
    };
  },
  noFlag: (key: string): GenericConditionCheck => {
    return (d: GameState): boolean => {
      let value = d.data.run.flags[key] ?? null;
      if (value === null) return true;
      return false;
    };
  },

  skillModifier: (skill: Skill, mod: number) => {
    return (state: GameState) => {
      if (!state.data.run.bakery) sendBakeSignal();
      return (state.data.run.bakery?.modifiers.total[skill] ?? 0) >= mod;
    };
  },

  inLocation: (locations: Location | Location[]): GenericConditionCheck => {
    let all = Array.isArray(locations) ? locations : [locations];
    return (d: GameState): boolean => all.includes(d.data.run.location);
  },
  inSubLocation: (location: SubLocation): GenericConditionCheck => {
    return (d: GameState): boolean => d.data.run.subLocation === location;
  },
  hasKnowledge: (k: string): GenericConditionCheck => {
    return (d: GameState): boolean => d.data.global.knowledge.includes(k);
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
  if: (
    condition: (d: GameState) => boolean,
    t: (d: GameState) => GameState
  ) => {
    return (d: GameState) => {
      if (condition(d)) {
        return t(d);
      }
      return d;
    };
  },
  addLog: (text: string) => {
    return (d: GameState) => {
      d.data.run.logEntries.push({ ts: d.data.run.timeSpent, text });
      return d;
    };
  },
  addFlag: (key: string, value: string | null = null) => {
    return (d: GameState) => {
      d.data.run.flags[key] = value;
      return d;
    };
  },
  patchFlag: (key: string, patcher: (value: string | null) => string) => {
    return (d: GameState) => {
      let rawValue = d.data.run.flags[key] ?? null;
      let newValue = patcher(rawValue);
      d.data.run.flags[key] = newValue;
      return d;
    };
  },
  patchFlagNumeric: (key: string, patcher: (value: number) => number) => {
    return (d: GameState) => {
      let rawValue = d.data.run.flags[key] ?? null;
      let numValue = Number.parseInt(rawValue ?? "0");
      let newValue = patcher(numValue);
      d.data.run.flags[key] = newValue.toString();
      return d;
    };
  },
  removeFlag: (key: string) => {
    return (d: GameState) => {
      delete d.data.run.flags[key];
      return d;
    };
  },
  addItem(itemId: ItemKey, amount: number) {
    return (state: GameState) => {
      if (!state.data.run.inventory[itemId]) {
        state.data.run.inventory[itemId] = { amount: 0, cooldown: 0 };
      }
      if (
        state.data.run.inventory[itemId].amount < items[itemId].capacity(state)
      ) {
        state.data.run.inventory[itemId].amount += Math.min(
          amount,
          items[itemId].capacity(state) -
            state.data.run.inventory[itemId].amount
        );
        if (
          state.data.run.inventory[itemId].amount >=
          items[itemId].capacity(state)
        ) {
          state.data.run.action = null;
        }
      }
      return state;
    };
  },

  removeItem: (id: ItemKey, amount: number) => {
    return (d: GameState) => {
      if (d.data.run.inventory[id]) {
        d.data.run.inventory[id].amount -= amount;
      }
      return d;
    };
  },
  moveSubLocation: (location: SubLocation) => {
    return (d: GameState) => {
      d.data.run.subLocation = location;
      sendSubLocationSignal();
      return d;
    };
  },
  addKnowledge: (id: string) => {
    return (d: GameState) => {
      console.log("adding", id);
      if (!d.data.global.knowledge.includes(id)) {
        console.log("OK add");
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
    if (text) {
      text += " — " + d.data.run.subLocation;
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

export const skills: Skill[] = [
  "exploration",
  "perception",
  "social",
  "engineering",
];
