import {
  COMPLETION_EFFECTS,
  CONDITION_CHECKS,
  REVEAL,
  withLogEntry,
} from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;

export const na641WesternMainStreetActions: ActionRepository = {
  intro_0: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Look around",
    skill: "exploration",
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
    ],
    postComplete: withLogEntry(
      "That is indeed some backalley of some unfamiliar town. You can hear some people wander around somewhere nearby",
    ),
  },
  intro_1: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check time leap device",
    skill: "perception",
    weight: 3,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("intro_0"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteGlobal("intro_1"),
      ),
    ],
    postComplete: withLogEntry(
      "Device on your wrist seems to be intact, but battery seems to rapidly degrade. Seems like you will shortly be back in your own time and (hopefully) place",
    ),
  },
  intro_confirm_tld: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Check time leap device",
    skill: "perception",
    weight: 3,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("intro_0"),
      CONDITION_CHECKS.ifActionCompleteGlobal("intro_1"),
    ],
    postComplete: withLogEntry(
      "Device is still intact. Actually, it is in the precisely same state as the last time you've checked it. You are in a time loop!",
    ),
  },
  intro_2: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Emerge from alley",
    skill: "exploration",
    weight: 4,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun("intro_1"),
        CONDITION_CHECKS.ifActionCompleteRun("intro_confirm_tld"),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.westernMainStreet,
      ),
    ],
  },
  narcadia_gather_info: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask around",
    skill: "social",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Asking around about where you are proved a surefire way to confuse people on the streets. You are on a streets of city called 'New Arcadia'",
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_gather_info"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      withLogEntry(
        "The first few people ignored your weird questions, seemingly alarmed. Finally, old guy you pestered went on to say that 'In our 641th year we're still unable to get smoking bins around every corner and now we've got weirdos asking stupid things' when prompted about current year. He is clearly upset with people tossing butts around",
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Rapid Delivery! Delivery as fast as it is named. Terms and conditions apply",
      ),
      COMPLETION_EFFECTS.addLog(
        "Care for history? Visit the NAWS History Museum!",
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Looking for loose coins under vending machines wouldnt be the worst idea in your situation",
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_moneymaking_seek"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 1),
      COMPLETION_EFFECTS.patchFlagNumeric("na641_rummage_naws", (v) => ++v),
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_moneymaking_seek"),
      CONDITION_CHECKS.numFlagGTE("na641_rummage_naws", 20),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.southern_outskirts),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.southern_vendomats),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.johnny_contact),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.REPUTATION.HOMELESS,
        (v) => ++v,
      ),
      COMPLETION_EFFECTS.addLog(
        "Apparently theres a lot of goods to scavenge under vendomats on Southern Main street",
      ),
      COMPLETION_EFFECTS.addLog(
        "Also you might meet Johnny in the outskirts, he'll know about you coming. He has few questionable but paying job offers",
      ),
    ],
  },
};

export const na641BackalleyActions: ActionRepository = {
  na641_western_main_street_return_backalley: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to backalley",
    flavourText: "There might be something that you can use...",
    skill: "exploration",
    weight: 60,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.TIME_LEAP.anchoring),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
    ],
  },
  na641_backalley_return_western_main_street: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Western Main Street",
    skill: "exploration",
    weight: 60,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.westernMainStreet,
      ),
    ],
  },
  na641_backalley_search_anchor: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Search for anchor",
    flavourText: "With all those violent zaps, maybe there is something",
    skill: "perception",
    weight: 1000,
    ...REVEAL.skillCheck("perception", 50),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.TIME_LEAP.anchoring),
      CONDITION_CHECKS.skillModifier("perception", 5),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.NA641.backalley_temporal_calibrator,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.backalley_temporal_calibrator,
      ),
      COMPLETION_EFFECTS.addLog("There is a piece of your lab equipment!"),
    ],
  },
  na641_backalley_pick_up_temporal_calibrator: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pick up broken temporal calibrator",
    skill: "engineering",
    weight: 40,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.westernMainStreetAlley,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.backalley_temporal_calibrator,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("anchor_broken_temporal_calibrator", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("anchor_broken_temporal_calibrator", 1),
      COMPLETION_EFFECTS.addLog(
        "Quite weird, but it anchors to New Arcadia in 641!",
      ),
    ],
  },
};
