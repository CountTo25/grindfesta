import type { Action, GameState } from "./types";
import { ifActionComplete, withLogEntry } from "./utils";

const NO_REPEAT = { repeatable: false };
const NO_CROSSGEN = { crossGeneration: false };
const NO_POSTCOMPLETE = { postComplete: [] };
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
      "Device on your wrist seems to be intact, but battery seems to rapidly degrade. Seems like you will shortly be back in your own time and (hopefully) place"
    ),
  },
  intro_2: {
    ...NO_REPEAT,
    ...NO_CROSSGEN,
    ...NO_POSTCOMPLETE,
    title: "Emerge from alley",
    skill: "exploration",
    weight: 10,
    conditions: [ifActionComplete("intro_1")],
  },
  narcadia_gather_info: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask around",
    skill: "social",
    weight: 10,
    conditions: [ifActionComplete("intro_2")],
    postComplete: [
      withLogEntry(
        "Asking around about where you are proved a surefire way to confuse people on the streets. You are on a streets of city called 'New Arcadia'"
      ),
    ],
  },
  narcadia_info_year: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask for more info",
    skill: "social",
    weight: 25,
    conditions: [ifActionComplete("narcadia_gather_info")],
    postComplete: [
      withLogEntry(
        "The first few people ignored your weird questions, seemingly alarmed. Finally, old guy you pestered went on to say that 'In our 641th year we're still unable to get smoking bins around every corner and now we've got weirdos asking stupid things' when prompted about current year. He is clearly upset with people tossing butts around"
      ),
    ],
  },
  narcadia_seek_init: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Examine the city",
    skill: "exploration",
    weight: 10,
    conditions: [ifActionComplete("intro_2")],
    postComplete: [],
  },
};
