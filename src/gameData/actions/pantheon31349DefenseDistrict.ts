import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;

const DEFENSE_DISTRICT_KNOWN = CONDITION_CHECKS.hasKnowledge(
  KNOWLEDGE.PANTHEON31349.defense_district,
);

export const pantheon31349DefenseDistrictActions: ActionRepository = {
  eternia31349_defense_district_survey_ordered_streets: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Survey the ordered streets",
    flavourText:
      "Geometrically perfect, nice and orderly. Still made of marble and gold",
    skill: "perception",
    weight: 1900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.magical_corps_hq,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.overlook_tower,
      ),
    ],
  },
  eternia31349_control_district_travel_to_defense_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Travel to Defense District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
      DEFENSE_DISTRICT_KNOWN,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
  },
  eternia31349_scholars_district_travel_to_defense_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Travel to Defense District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      DEFENSE_DISTRICT_KNOWN,
      CONDITION_CHECKS.ifActionCompleteRun(
        "pantheon31349_part_ways_with_hsak",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
  },
  eternia31349_defense_district_return_to_control_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Control District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.controlDistrict,
      ),
    ],
  },
  eternia31349_defense_district_return_to_scholars_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia31349_defense_district_visit_magical_corps_hq: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Magical Corps HQ",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.magical_corps_hq,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrictMagicalCorpsHq,
      ),
    ],
  },
  eternia31349_magical_corps_hq_return_to_defense_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Defense District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrictMagicalCorpsHq,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
  },
  eternia31349_defense_district_visit_overlook_tower: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Overlook Tower",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.overlook_tower,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrictOverlookTower,
      ),
    ],
  },
  eternia31349_overlook_tower_return_to_defense_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Defense District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrictOverlookTower,
      ),
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.TOWER_LEVEL_2),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.defenseDistrict,
      ),
    ],
  },
};
