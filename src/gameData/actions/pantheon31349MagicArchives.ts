import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
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

export const pantheon31349MagicArchivesActions: ActionRepository = {
  eternia31349_library_enter_magic_archives: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Magic Archives",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    ...REVEAL.runFlag(
      TAGS.PANTHEON31349.MAGIC_IMBUED,
      "Requires being imbued with magic",
    ),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.greatLibrary),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_archives_location,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_usage_basics,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
    ],
  },
  eternia31349_magic_archives_return_to_library: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Library",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
    ],
  },
  eternia31349_magic_archives_locate_introduction_to_control: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Locate «Introduction to control»",
    flavourText: "Book selection is astonishing",
    skill: "exploration",
    weight: 2400,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.introduction_to_control_location,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.introduction_to_control_location,
      ),
    ],
  },
  eternia31349_magic_archives_read_introduction_to_control: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read «Introduction to control»",
    flavourText: "There's a lot more to it than just moving beads",
    skill: "magic",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.introduction_to_control_location,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.control_basics,
      ),
    ],
  },
  eternia31349_magic_archives_pick_out_basic_manipulation: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Pick out «Basic manipulation»",
    flavourText: "Another beginner's title is hiding among the shelves",
    skill: "exploration",
    weight: 2800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.basic_manipulation_location,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_manipulation_location,
      ),
    ],
  },
  eternia31349_magic_archives_work_through_basic_manipulation: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Work through «Basic manipulation»",
    flavourText: "Theory only gets you so far",
    skill: "magic",
    weight: 30,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_manipulation_location,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.manipulation_basics,
      ),
    ],
  },
  eternia31349_magic_archives_find_works_on_light_magic: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Find works on light magic",
    flavourText: "That'll surely come in handy",
    skill: "exploration",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.light_source_may_be_needed,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.light_magic_works_location,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.light_magic_works_location,
      ),
    ],
  },
  eternia31349_magic_archives_read_light_the_way: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read «Light the way»",
    flavourText:
      "This work describes one of most useful appliances — manipulating light",
    skill: "perception",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicArchives,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.light_magic_works_location,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_magic_literature,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.light_magic_beginner,
      ),
    ],
  },
};
