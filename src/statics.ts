import type { Action } from "./types";
import { withLogEntry } from "./utils";

export const actions: { [key: string]: Action } = {
  la_intro_0: {
    title: "Look around",
    skill: "perception",
    weight: 10,
    conditions: [],
    repeatable: false,
    crossGeneration: false,
    postComplete: withLogEntry(
      "That is indeed some backalley of some unfamiliar town. "
    ),
  },
};
