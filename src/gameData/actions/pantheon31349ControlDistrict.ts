import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;

export const pantheon31349ControlDistrictActions: ActionRepository = {
  eternia31349_travel_to_control_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Travel to Control District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.control_district,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "pantheon31349_part_ways_with_hsak",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
    ],
  },
  eternia31349_return_to_scholars_district_from_control_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia31349_control_district_take_in_district: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Take in the view",
    flavourText: "Marvelous waterfalls and lush greenery are overwhelming",
    skill: "perception",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.control_center,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.dome_gardens,
      ),
    ],
  },
  eternia31349_control_district_visit_control_center: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Control Center",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.control_center,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrictControlCenter,
      ),
    ],
  },
  eternia31349_control_center_return_to_control_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Control District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrictControlCenter,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
    ],
  },
  eternia31349_control_district_visit_dome_gardens: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Dome Gardens",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.dome_gardens,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrictDomeGardens,
      ),
    ],
  },
  eternia31349_dome_gardens_return_to_control_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Control District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrictDomeGardens,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
    ],
  },
};
