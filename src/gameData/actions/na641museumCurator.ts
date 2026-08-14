import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  type ActionRepository,
} from "./utils";

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;
const CURATOR_BOOK_EXPLANATION_COMPLETE = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_lie"),
  CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_tell_truth"),
]);
const CURATOR_JOB_OUTCOME_COMPLETE = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun(
    "na641_museum_curator_ask_to_keep_book",
  ),
  CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_report_job_done"),
]);

export const museumCuratorActions: ActionRepository = {
  na641_museum_curator_greet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Greet the Curator",
    flavourText: "Quite a young man, but he's clearly obsessed with history",
    skill: "social",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.museum_curator_identity),
    ],
  },
  na641_museum_curator_read_copied_pages: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Read copied pages",
    flavourText: "That's quite doable! Appears to be a children's book",
    skill: "perception",
    weight: 2200,
    ...REVEAL.all([
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.language_medium),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.basic_symbolics),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_greet"),
    ],
  },
  na641_museum_curator_hear_out: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Hear Curator out",
    flavourText: "He's surprised by you handling it with ease!",
    skill: "social",
    weight: 2250,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_greet"),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_curator_read_copied_pages",
      ),
    ],
  },
  na641_museum_curator_inspect_sealed_tome: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Inspect sealed tome",
    flavourText: "Apparently there's this weird tome no one can open",
    skill: "perception",
    weight: 2300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_greet"),
      CONDITION_CHECKS.ifActionCompleteRun("na641_museum_curator_hear_out"),
    ],
  },
  na641_museum_curator_open_sealed_book: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Open sealed book",
    flavourText: "Let's take a peek",
    skill: "magic",
    weight: 280,
    ...REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.control_medium),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_curator_inspect_sealed_tome",
      ),
    ],
  },
  na641_museum_curator_lie: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Lie to Curator",
    flavourText: "There's an obscure mechanism there",
    skill: "engineering",
    weight: 3000,
    ...REVEAL.skillCheck("engineering", 200),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_curator_open_sealed_book",
      ),
      CONDITION_CHECKS.not(CURATOR_BOOK_EXPLANATION_COMPLETE),
    ],
  },
  na641_museum_curator_tell_truth: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Tell Curator the truth",
    flavourText: "No point hiding it",
    skill: "social",
    weight: 2400,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_curator_open_sealed_book",
      ),
      CONDITION_CHECKS.not(CURATOR_BOOK_EXPLANATION_COMPLETE),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.MUSEUM.CURATOR_KNOWS, "1"),
      COMPLETION_EFFECTS.reachMilestone("na641_curator_knows"),
    ],
  },
  na641_museum_curator_read_tales_of_eternia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read «Tales of Eternia»",
    flavourText: "A gift from the past",
    skill: "perception",
    weight: 4000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CURATOR_BOOK_EXPLANATION_COMPLETE,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.gods_persisted_memories,
      ),
    ],
  },
  na641_museum_curator_discuss_tales_of_eternia: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Discuss with Curator",
    flavourText:
      "Book starts with «To you, traveller». Let's help him decipher it",
    skill: "social",
    weight: 2500,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CURATOR_BOOK_EXPLANATION_COMPLETE,
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_museum_curator_read_tales_of_eternia",
      ),
    ],
  },
  na641_museum_curator_ask_to_keep_book: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Persuade Curator into giving up the book",
    flavourText: "This is an anchor. You need to see what's there",
    skill: "social",
    weight: 5000,
    ...REVEAL.all([
      REVEAL.skillCheck("social", 1000),
      REVEAL.itemNotCappedYet("anchor_god_of_knowledge_book"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_curator_discuss_tales_of_eternia",
      ),
      CONDITION_CHECKS.not(CURATOR_JOB_OUTCOME_COMPLETE),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("anchor_god_of_knowledge_book", 1),
      COMPLETION_EFFECTS.reachMilestone("na641_gift_across_time"),
    ],
  },
  na641_museum_curator_report_job_done: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Report job done",
    flavourText:
      "You've done what you could. Next edition of the exhibition will be an eye-opener!",
    skill: "social",
    weight: 2600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumCuratorsOffice,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_curator_discuss_tales_of_eternia",
      ),
      CONDITION_CHECKS.not(CURATOR_JOB_OUTCOME_COMPLETE),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 50),
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.MUSEUM.HELPING_OUT_FINISHED,
        "1",
      ),
    ],
  },
};
