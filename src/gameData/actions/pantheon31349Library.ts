import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;

export const pantheon31349LibraryActions: ActionRepository = {
  pantheon31349_greet_author: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Greet the author",
    flavourText: "It is quite obvious that this is the moment he finished the book",
    skill: "social",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
    ],
  },
  pantheon31349_decipher_authors_answer: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Try to figure out his answer",
    flavourText: "The language is the same, but different",
    skill: "perception",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
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
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Clarify whereabouts",
    flavourText: "This will backfire, right? He's probably shocked",
    skill: "social",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_greet_author"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.whereabouts,
      ),
    ],
  },
  pantheon31349_follow_author: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Follow the Author",
    flavourText: "He is not that surprised about you appearing outta nowhere",
    skill: "exploration",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "pantheon31349_clarify_whereabouts",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.HSAK_FOLLOWS, "1"),
    ],
  },
  pantheon31349_look_at_tomes: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look at the tomes",
    flavourText: "Books here are vibrant and rich, but titles are unreadable",
    skill: "perception",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_follow_author"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_symbolics,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.book_assortment,
      ),
    ],
  },
  pantheon31349_leave_with_hsak: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Leave with H'sak",
    flavourText:
      "Now you know his name. But how is he opening doors remotely?",
    skill: "exploration",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_follow_author"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
};
