import { na641junkActions } from "./gameData/actions/na641junk";
import { marcosWorkshopActions } from "./gameData/actions/na641marcos";
import { na641miscActions } from "./gameData/actions/na641misc";
import { museumActions } from "./gameData/actions/na641museum";
import { rapidDeliveryActions } from "./gameData/actions/na641rapid";
import { na641southActions } from "./gameData/actions/na641south";
import {
  NO_REPEAT,
  NO_CROSSGEN,
  CROSSGEN,
  REPEATABLE,
} from "./gameData/actions/utils";
import { KNOWLEDGE, TAGS } from "./gameData/tags";
import type { Action, GameState } from "./types";
import {
  COMPLETION_EFFECTS,
  CONDITION_CHECKS,
  REVEAL,
  withLogEntry,
} from "./utils";

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
    ...REVEAL.itemNotCappedYet("narcadia641_zenny"),
    weight: 7,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.inSubLocation("Western main street"),
        CONDITION_CHECKS.inSubLocation("Southern main street"),
      ]),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_moneymaking_seek"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 1),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.ACTIONS.RUMMAGE,
        (v) => ++v
      ),
      COMPLETION_EFFECTS.if(
        CONDITION_CHECKS.numFlag(
          TAGS.NA641.ACTIONS.RUMMAGE,
          (v) => v % 10 === 0
        ),
        [
          COMPLETION_EFFECTS.patchFlagNumeric(TAGS.NA641.SUS_LEVEL, (v) => ++v),
          COMPLETION_EFFECTS.addLog(
            "People start to wonder what are you doing..."
          ),
          //BEAUTIFUL!
          COMPLETION_EFFECTS.match(
            (v) => Number.parseInt(v.data.run.flags[TAGS.NA641.SUS_LEVEL]!),
            [
              COMPLETION_EFFECTS.MATCHER(
                1,
                COMPLETION_EFFECTS.addLog(
                  "Seems like you draw too much attention going around and looking for coins"
                )
              ),
              COMPLETION_EFFECTS.MATCHER(
                2,
                COMPLETION_EFFECTS.addLog(
                  "Apparently people dont like to see someone scavenging under vendomats"
                )
              ),
              COMPLETION_EFFECTS.MATCHER(
                (v: number) => v >= 3,
                [
                  COMPLETION_EFFECTS.addLog("Someone called guards on you!!"),
                  COMPLETION_EFFECTS.addFlag(
                    TAGS.NA641.REPUTATION.COPS_ALERT,
                    "1"
                  ),
                  COMPLETION_EFFECTS.addFlag(
                    TAGS.NA641.REPUTATION.COPS_ALERT_REASON,
                    TAGS.NA641.COPS_ALERT_REASONS.JIHANKI
                  ),
                  COMPLETION_EFFECTS.addFlag(TAGS.SYSTEM.ACTION_LOCK, "1"),
                ]
              ),
            ]
          ),
        ]
      ),
    ],
  },
  na641_homeless_wistom: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Listen to the wisdom of the homeless man",
    flavourText: "While salvaging for coins, you see someone approach you",
    skill: "social",
    weight: 60,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_moneymaking_seek"),
      CONDITION_CHECKS.numFlagGTE("na641_rummage_naws", 25),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.southern_outskirts),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.southern_vendomats),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.johnny_contact),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.REPUTATION.HOMELESS,
        (v) => ++v
      ),
      COMPLETION_EFFECTS.addLog(
        "Apparently theres a lot of goods to scavenge under vendomats on Southern Main street"
      ),
      COMPLETION_EFFECTS.addLog(
        "Also you might meet Johnny in the ourskirts, he'll know about you coming. He has few questionable but paying job offers (TODO, not implemented yet)"
      ),
    ],
  },

  ...marcosWorkshopActions,
  ...museumActions,
  ...rapidDeliveryActions,
  ...na641southActions,
  ...na641junkActions,
  ...na641miscActions,
};
