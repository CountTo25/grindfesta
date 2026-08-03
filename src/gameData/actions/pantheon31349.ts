import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  type ActionRepository,
} from "./utils";

const PANTHEON31349 = LOCATIONS.pantheon31349;
const PANTHEON31349_SUBLOCATIONS = SUBLOCATIONS.pantheon31349;

export const pantheon31349Actions: ActionRepository = {
  pantheon31349_greet_author: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Greet the author",
    flavourText: "It is quite obvious that this is the moment he finished the book",
    skill: "social",
    weight: 2500,
    conditions: [
      CONDITION_CHECKS.inLocation(PANTHEON31349),
      CONDITION_CHECKS.inSubLocation(
        PANTHEON31349_SUBLOCATIONS.greatLibrary,
      ),
    ],
  },
  pantheon31349_decipher_authors_answer: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Try to figure out his answer",
    flavourText: "The language is the same, but different",
    skill: "perception",
    weight: 3000,
    conditions: [
      CONDITION_CHECKS.inLocation(PANTHEON31349),
      CONDITION_CHECKS.inSubLocation(
        PANTHEON31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_greet_author"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.language_basics,
      ),
    ],
  },
  pantheon31349_clarify_whereabouts: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Clarify whereabouts",
    flavourText: "This will backfire, right? He's probably shocked",
    skill: "social",
    weight: 2800,
    conditions: [
      CONDITION_CHECKS.inLocation(PANTHEON31349),
      CONDITION_CHECKS.inSubLocation(
        PANTHEON31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_greet_author"),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.language_basics,
      ),
    ],
    postComplete: [],
  },
};
