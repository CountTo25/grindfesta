import type { Action } from "./types";

export const actions: { [key: string]: Action } = {
  la_intro_0: {
    title: "Look around",
    skill: "perception",
    weight: 10,
    conditions: [],
    repeatable: false,
    crossGeneration: false,
    postComplete: (s) => s,
  },
};
