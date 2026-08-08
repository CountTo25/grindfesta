import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import type { GameState } from "../../types";
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

const IN_GREAT_LIBRARY = [
  CONDITION_CHECKS.inLocation(ETERNIA31349),
  CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.greatLibrary),
];
const IN_LIBRARY_STORAGE = [
  CONDITION_CHECKS.inLocation(ETERNIA31349),
  CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.libraryStorage),
];

const payForSortedBooks = (state: GameState) => {
  const booksSorted = Number.parseInt(
    state.data.run.flags[TAGS.PANTHEON31349.LIBRARY_BOOKS_SORTED] ?? "0",
  );
  return COMPLETION_EFFECTS.addItem(
    "eternia31349_gald",
    booksSorted * 10,
  )(state);
};

export const pantheon31349LibraryJobActions: ActionRepository = {
  eternia31349_library_apply_for_sorting_job: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Apply for a sorting job",
    flavourText: "10 Gald per book. Report back to get paid",
    skill: "social",
    weight: 1000,
    ...REVEAL.all([
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.currency),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.language_basics),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.basic_symbolics),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.manipulation_basics),
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
    ]),
    conditions: [
      ...IN_GREAT_LIBRARY,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.HSAK_IN_LIBRARY),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOT_JOB_OFFER_SORTING_LIBRARY,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.library_sorting_job,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.LIBRARY_BOOKS_SORTED,
        "0",
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_CYCLES,
        "0",
      ),
    ],
  },
  eternia31349_library_visit_storage: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Great Library storage",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      ...IN_GREAT_LIBRARY,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_library_apply_for_sorting_job",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.libraryStorage,
      ),
    ],
  },
  eternia31349_library_storage_return_to_library: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Library",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [...IN_LIBRARY_STORAGE],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
    ],
  },
  eternia31349_library_report_organized_books: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Report organized books",
    flavourText: "10 Gald per book!",
    skill: "magic",
    weight: 40,
    ...REVEAL.all([
      REVEAL.runFlag(
        TAGS.PANTHEON31349.BANK_ACCOUNT_INFO,
        "Requires your bank info",
      ),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.currency_operation),
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
    ]),
    conditions: [
      ...IN_GREAT_LIBRARY,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.HSAK_IN_LIBRARY),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_library_apply_for_sorting_job",
      ),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.PANTHEON31349.LIBRARY_BOOKS_SORTED,
        1,
      ),
    ],
    postComplete: [
      payForSortedBooks,
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.LIBRARY_BOOKS_SORTED,
        "0",
      ),
    ],
  },
  eternia31349_library_find_misplaced_book: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Find misplaced books",
    flavourText: "Why don't people clean up after themselves?!",
    skill: "perception",
    weight: 800,
    conditions: [
      ...IN_LIBRARY_STORAGE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_library_apply_for_sorting_job",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.manipulation_basics,
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
        "1",
      ),
    ],
  },
  eternia31349_library_find_book_shelf: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Find where to put the book away",
    flavourText: "Multi-story shelves are haunting",
    skill: "exploration",
    weight: 1000,
    conditions: [
      ...IN_LIBRARY_STORAGE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_library_apply_for_sorting_job",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.manipulation_basics,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.numFlagLTE(
          TAGS.PANTHEON31349.LIBRARY_SORTING_CYCLES,
          2,
        ),
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.energy_manipulation,
        ),
      ]),
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_SHELF_FOUND,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_SHELF_FOUND,
        "1",
      ),
    ],
  },
  eternia31349_library_check_energy_and_magic_cover: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Check the cover carefully",
    flavourText: "This is «Energy and magic»",
    skill: "perception",
    weight: 600,
    conditions: [
      ...IN_LIBRARY_STORAGE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_library_apply_for_sorting_job",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_SHELF_FOUND,
      ),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.PANTHEON31349.LIBRARY_SORTING_CYCLES,
        3,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.energy_manipulation,
        ),
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.LIBRARY_ENERGY_AND_MAGIC_FOUND,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.LIBRARY_ENERGY_AND_MAGIC_FOUND,
        "1",
      ),
    ],
  },
  eternia31349_library_read_energy_and_magic: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read «Energy and magic»",
    skill: "magic",
    weight: 70,
    conditions: [
      ...IN_LIBRARY_STORAGE,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.LIBRARY_ENERGY_AND_MAGIC_FOUND,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.energy_manipulation,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.energy_manipulation,
      ),
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.LIBRARY_ENERGY_AND_MAGIC_FOUND,
      ),
    ],
  },
  eternia31349_library_put_book_away: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Put book nicely in its place",
    flavourText: "Magic is convenient",
    skill: "magic",
    weight: 20,
    ...REVEAL.all([
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.manipulation_basics),
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
    ]),
    conditions: [
      ...IN_LIBRARY_STORAGE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_library_apply_for_sorting_job",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_SHELF_FOUND,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_BOOK_FOUND,
      ),
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.LIBRARY_SORTING_SHELF_FOUND,
      ),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.PANTHEON31349.LIBRARY_BOOKS_SORTED,
        (books) => books + 1,
      ),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.PANTHEON31349.LIBRARY_SORTING_CYCLES,
        (cycles) => cycles + 1,
      ),
    ],
  },
};
