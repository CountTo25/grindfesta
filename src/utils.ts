import type { GameState, LogEntry } from "./types";

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
