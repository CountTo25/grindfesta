import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;

export const pantheon31349ScholarsDistrictActions: ActionRepository = {
  pantheon31349_listen_closely: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Listen closely",
    flavourText:
      "«Magic is mysterious. Seems I've summoned you into this world — now I shall let you run amok in it»",
    skill: "social",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.HSAK_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.PANTHEON31349.magic),
    ],
  },
  pantheon31349_part_ways_with_hsak: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Part ways",
    flavourText:
      "«Shall you ever need me — I'll be in the Library to guide you»",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.HSAK_FOLLOWS),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_listen_closely"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.PANTHEON31349.HSAK_FOLLOWS),
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.HSAK_IN_LIBRARY, "1"),
    ],
  },
  pantheon31349_enter_library: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Enter Library",
    skill: "exploration",
    weight: 150,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_leave_with_hsak"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
    ],
  },
  pantheon31349_return_to_scholars_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 150,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_leave_with_hsak"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
};
