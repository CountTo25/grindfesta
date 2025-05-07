import type { Action, GameState } from "./types";
import { ifActionComplete, withLogEntry } from "./utils";

const NO_REPEAT = { repeatable: false };
const NO_CROSSGEN = { crossGeneration: false };
export const actions: { [key: string]: Action } = {
  intro_0: {
    title: "Look around",
    skill: "exploration",
    weight: 5,
    conditions: [],
    repeatable: false,
    crossGeneration: false,
    postComplete: withLogEntry(
      "That is indeed some backalley of some unfamiliar town. You can hear some people wander around somewhere nearby"
    ),
  },
  intro_1: {
    title: "Check time leap device",
    skill: "perception",
    weight: 5,
    conditions: [ifActionComplete("intro_0")],
    repeatable: false,
    crossGeneration: false,
    postComplete: withLogEntry(
      "Device on your wrist seems to be intact, but there is not enough energy. Seems like you will shortly be back in your own time and (hopefully) place"
    ),
  },
  intro_2: {
    ...NO_REPEAT,
    ...NO_CROSSGEN,
    title: "Emerge from alley",
    skill: "exploration",
    weight: 10,
    conditions: [ifActionComplete("intro_1")],
    postComplete: null,
  },
  narcadia_gather_info: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask around",
    skill: "social",
    weight: 10,
    conditions: [ifActionComplete("intro_2")],
    postComplete: null,
  },
  narcadia_seek_init: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Examine the city",
    skill: "exploration",
    weight: 10,
    conditions: [ifActionComplete("intro_2")],
    postComplete: null,
  },
};
