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

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;

export const masterLibrarianActions: ActionRepository = {
  na641_library_visit_master_librarian_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Master Librarian chambers",
    skill: "exploration",
    weight: 200,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.library_master_librarian_chambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
    ],
  },
  na641_library_leave_master_librarian_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to library",
    skill: "exploration",
    weight: 40,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
    ],
  },
  na641_master_librarian_greet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Greet the Librarian",
    flavourText: "His figure as imposing as you'd expect",
    skill: "social",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone(
        "na641_audience_with_master_librarian",
      ),
    ],
  },
  na641_master_librarian_discuss_learned_material: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Discuss learned material",
    flavourText: "Time spent hitting books pays off",
    skill: "social",
    weight: 1300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_master_librarian_greet"),
    ],
    postComplete: [],
  },
  na641_master_librarian_answer_questions: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Answer Master's questions",
    flavourText: "Will passing this test lead you somewhere?",
    skill: "perception",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_discuss_learned_material",
      ),
    ],
    postComplete: [],
  },
  na641_master_librarian_answer_questions_repeat: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Answer Master's questions",
    flavourText: "You already know what he will ask you",
    skill: "perception",
    weight: 400,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_discuss_learned_material",
      ),
      CONDITION_CHECKS.ifActionCompleteGlobal(
        "na641_master_librarian_answer_questions",
      ),
    ],
    postComplete: [],
  },
  na641_master_librarian_follow_to_special_shelf: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Follow Master to special shelf",
    flavourText: "Of course, his chambers are lined with rare books",
    skill: "exploration",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_master_librarian_answer_questions",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_master_librarian_answer_questions_repeat",
        ),
      ]),
    ],
    postComplete: [],
  },
  na641_master_librarian_glance_over_books: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Glance over books",
    flavourText: "Is there anything you might find interesting?",
    skill: "perception",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_follow_to_special_shelf",
      ),
    ],
    postComplete: [],
  },
  na641_master_librarian_pick_green_metal_tome: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pick green metal tome",
    flavourText: "This cover is made of Aurexite!",
    skill: "perception",
    weight: 400,
    ...REVEAL.skillCheck("perception", 40),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_glance_over_books",
      ),
    ],
    postComplete: [],
  },
  na641_master_librarian_decipher_green_tome: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Attempt to decipher archaic writings",
    flavourText: "There's something about this book...",
    skill: "perception",
    weight: 1800,
    ...REVEAL.skillCheck("perception", 55),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_pick_green_metal_tome",
      ),
    ],
    postComplete: [COMPLETION_EFFECTS.addLog("This is an anchor!")],
  },
  na641_master_librarian_consult_about_green_tome: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Consult with Master Librarian",
    flavourText: "You cannot decipher it. You need help",
    skill: "social",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_decipher_green_tome",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("He is intrigued by you picking this out"),
    ],
  },
  na641_master_librarian_accept_tome_offer: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Accept Master's offer",
    flavourText:
      "You get the book for the time being — and you decipher it for the library",
    skill: "social",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_consult_about_green_tome",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("anchor_aurexite_tome", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("anchor_aurexite_tome", 1),
      COMPLETION_EFFECTS.reachMilestone("na641_acquire_aurexite_tome"),
    ],
  },
  na641_master_librarian_read_prehistoric_mutations: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read «Prehistoric mutations»",
    flavourText: "Learn about weird fauna of Old Arcadia",
    skill: "perception",
    weight: 1820,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibraryMasterLibrarianChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_master_librarian_glance_over_books",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.prehistoric_mutations,
      ),
    ],
  },
};
