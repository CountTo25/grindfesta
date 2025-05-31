import { macrosWorkshopActions } from "./gameData/actions/na641macros";
import { museumActions } from "./gameData/actions/na641museum";
import { rapidDeliveryActions } from "./gameData/actions/na641rapid";
import {
  NO_REPEAT,
  NO_CROSSGEN,
  CROSSGEN,
  REPEATABLE,
} from "./gameData/actions/utils";
import type { Action, GameState } from "./types";
import { COMPLETION_EFFECTS, CONDITION_CHECKS, withLogEntry } from "./utils";

export const actions: { [key: string]: Action } = {
  intro_0: {
    title: "Look around",
    skill: "exploration",
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street alley"),
    ],
    repeatable: false,
    crossGeneration: false,
    postComplete: withLogEntry(
      "That is indeed some backalley of some unfamiliar town. You can hear some people wander around somewhere nearby"
    ),
  },
  intro_1: {
    title: "Check time leap device",
    skill: "perception",
    weight: 3,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street alley"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_0"),
      CONDITION_CHECKS.not(CONDITION_CHECKS.ifActionCompleteGlobal("intro_1")),
    ],
    repeatable: false,
    crossGeneration: true,
    postComplete: withLogEntry(
      "Device on your wrist seems to be intact, but battery seems to rapidly degrade. Seems like you will shortly be back in your own time and (hopefully) place"
    ),
  },
  intro_confirm_tld: {
    title: "Check time leap device",
    skill: "perception",
    weight: 3,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street alley"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_0"),
      CONDITION_CHECKS.ifActionCompleteGlobal("intro_1"),
    ],
    repeatable: false,
    crossGeneration: false,
    postComplete: withLogEntry(
      "Device is still intact. Actually, it is in the precisely same state as the last time you've checked it. You are in a time loop!"
    ),
  },
  intro_2: {
    ...NO_REPEAT,
    ...NO_CROSSGEN,
    title: "Emerge from alley",
    skill: "exploration",
    weight: 4,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street alley"),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun("intro_1"),
        CONDITION_CHECKS.ifActionCompleteRun("intro_confirm_tld"),
      ]),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Western main street")],
  },
  narcadia_gather_info: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask around",
    skill: "social",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Asking around about where you are proved a surefire way to confuse people on the streets. You are on a streets of city called 'New Arcadia'"
      ),
      COMPLETION_EFFECTS.addKnowledge("new_arcadia_town_name"),
    ],
  },
  narcadia_info_year: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask for more info",
    skill: "social",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_gather_info"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      withLogEntry(
        "The first few people ignored your weird questions, seemingly alarmed. Finally, old guy you pestered went on to say that 'In our 641th year we're still unable to get smoking bins around every corner and now we've got weirdos asking stupid things' when prompted about current year. He is clearly upset with people tossing butts around"
      ),
      COMPLETION_EFFECTS.addKnowledge("new_arcadia_year"),
    ],
  },
  narcadia_seek_init: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Examine shop signs",
    skill: "perception",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "There is advert about watchmaker workshop being located nearby"
      ),
      COMPLETION_EFFECTS.addLog(
        "Rapid Delivery! Delivery as fast as it is named. Terms and conditions apply"
      ),
      COMPLETION_EFFECTS.addLog(
        "Care for history? Visit the NAWS History Museum!"
      ),
    ],
  },
  narcadia_moneymaking_seek: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for a ways to earn money",
    skill: "exploration",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Looking for loose coins under vending machines wouldnt be the worst idea in your situation"
      ),
    ],
  },
  narcadia_loot_jidouhanbaiki: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Rummage under vending machines",
    skill: "perception",
    weight: 7,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_moneymaking_seek"),
    ],
    grants: ["narcadia641_zenny"],
    postComplete: [],
  },

  ...macrosWorkshopActions,
  ...museumActions,
  ...rapidDeliveryActions,
};
