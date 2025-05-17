import type { Action } from "../../types";
///
export const NO_REPEAT = { repeatable: false };
export const REPEATABLE = { repeatable: true };
export const NO_CROSSGEN = { crossGeneration: false };
export const CROSSGEN = { crossGeneration: true };
export const NO_POSTCOMPLETE = { postComplete: [] };
export type ActionRepository = { [key: string]: Action };
