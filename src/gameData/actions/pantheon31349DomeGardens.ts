import type { GameState } from "../../types";
import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const DOME_GARDENS =
  SUBLOCATIONS.eternia31349.controlDistrictDomeGardens;

const IN_DOME_GARDENS = [
  CONDITION_CHECKS.inLocation(ETERNIA31349),
  CONDITION_CHECKS.inSubLocation(DOME_GARDENS),
];

const recordWateredPlant = [
  COMPLETION_EFFECTS.patchFlagNumeric(
    TAGS.PANTHEON31349.DOME_GARDENS_PLANTS_WATERED,
    (plants) => plants + 1,
  ),
  COMPLETION_EFFECTS.patchFlagNumeric(
    TAGS.PANTHEON31349.DOME_GARDENS_REPORTABLE_PLANTS_WATERED,
    (plants) => plants + 1,
  ),
];

const payForWateredPlants = (state: GameState) => {
  const plantsWatered = Number.parseInt(
    state.data.run.flags[
      TAGS.PANTHEON31349.DOME_GARDENS_REPORTABLE_PLANTS_WATERED
    ] ?? "0",
  );
  return COMPLETION_EFFECTS.addItem(
    "eternia31349_gald",
    plantsWatered * 10,
  )(state);
};

export const pantheon31349DomeGardensActions: ActionRepository = {
  eternia31349_dome_gardens_check_out_flora: {
    ...CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Check out the flora",
    flavourText:
      "Central park for citizens of Eternia — marvelously lush and vibrant",
    skill: "perception",
    weight: 3000,
    conditions: IN_DOME_GARDENS,
  },
  eternia31349_dome_gardens_meet_garden_master: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Meet Garden Master",
    flavourText: "It seems like he's older than this city!",
    skill: "social",
    weight: 1800,
    conditions: [
      ...IN_DOME_GARDENS,
      CONDITION_CHECKS.ifActionCompleteAny(
        "eternia31349_dome_gardens_check_out_flora",
      ),
    ],
  },
  eternia31349_dome_gardens_agree_to_help_out: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Agree to help out",
    flavourText:
      "He's very happy to let a new citizen get some magic practice!",
    skill: "social",
    weight: 1900,
    conditions: [
      ...IN_DOME_GARDENS,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_dome_gardens_meet_garden_master",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.DOME_GARDENS_WORK_AVAILABLE,
        "1",
      ),
    ],
  },
  eternia31349_dome_gardens_water_plants: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Water plants",
    skill: "perception",
    weight: 1700,
    conditions: [
      ...IN_DOME_GARDENS,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.DOME_GARDENS_WORK_AVAILABLE,
      ),
    ],
    postComplete: recordWateredPlant,
  },
  eternia31349_dome_gardens_report_to_garden_master: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Report back to Garden Master",
    flavourText: "Get paid!",
    skill: "social",
    weight: 1800,
    ...REVEAL.all([
      REVEAL.runFlag(
        TAGS.PANTHEON31349.BANK_ACCOUNT_INFO,
        "Requires your bank info",
      ),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.currency_operation),
    ]),
    conditions: [
      ...IN_DOME_GARDENS,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.DOME_GARDENS_WORK_AVAILABLE,
      ),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.PANTHEON31349.DOME_GARDENS_REPORTABLE_PLANTS_WATERED,
        1,
      ),
    ],
    postComplete: [
      payForWateredPlants,
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.DOME_GARDENS_REPORTABLE_PLANTS_WATERED,
        "0",
      ),
    ],
  },
  eternia31349_dome_gardens_discuss_effective_watering: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Discuss effective watering",
    flavourText: "As always, the answer to everything is magic",
    skill: "magic",
    weight: 280,
    ...REVEAL.runFlag(
      TAGS.PANTHEON31349.MAGIC_IMBUED,
      "Requires being imbued with magic",
    ),
    conditions: [
      ...IN_DOME_GARDENS,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.DOME_GARDENS_WORK_AVAILABLE,
      ),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.PANTHEON31349.DOME_GARDENS_PLANTS_WATERED,
        5,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.water_manipulation_basics,
      ),
    ],
  },
  eternia31349_dome_gardens_water_plants_magically: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Water plants, magically",
    flavourText: "This is a lot easier!",
    skill: "magic",
    weight: 400,
    ...REVEAL.runFlag(
      TAGS.PANTHEON31349.MAGIC_IMBUED,
      "Requires being imbued with magic",
    ),
    conditions: [
      ...IN_DOME_GARDENS,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.DOME_GARDENS_WORK_AVAILABLE,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.water_manipulation_basics,
      ),
    ],
    postComplete: recordWateredPlant,
  },
};
