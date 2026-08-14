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
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;
const NO_CASM_BEAD_RESULT = [
  CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.CASM_BEADS_BASIC),
  CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.CASM_BEADS_IMPRESSED),
  CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.CASM_BEADS_OVERACHIEVED),
  CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.CASM_BEADS_SHOCKED),
];

export const pantheon31349DiviningChambersActions: ActionRepository = {
  eternia31349_divining_chambers_gaze_upon_statue: {
    ...CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Gaze upon statue",
    flavourText: "A huge monolith made of the purest Aurexite you've seen",
    skill: "perception",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
    ],
  },
  eternia31349_divining_chambers_inspect_aurexite: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Inspect Aurexite",
    flavourText: "It feels oddly mechanical",
    skill: "engineering",
    weight: 10000,
    ...REVEAL.skillCheck("engineering", 1000),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "eternia31349_divining_chambers_gaze_upon_statue",
      ),
      CONDITION_CHECKS.skillModifier("engineering", 200),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_tech_connection_1,
      ),
    ],
  },
  eternia31349_divining_chambers_meet_devouts: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Meet the devouts",
    flavourText:
      "Everyone is walking around, praying and doing weird gestures. Magic",
    skill: "social",
    weight: 1300,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "eternia31349_divining_chambers_gaze_upon_statue",
      ),
    ],
  },
  eternia31349_divining_chambers_hear_casm_out: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Hear Casm out",
    flavourText: "One of the higher-ranking members already knows about you",
    skill: "social",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_meet_devouts",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("eternia31349_hear_casm_out"),
    ],
  },
  eternia31349_divining_chambers_magic_basics_lesson: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Get a lesson on the basics of magic",
    flavourText:
      "Apparently, you just need to stay there — near the monolith — to be enlightened",
    skill: "perception",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_hear_casm_out",
      ),
    ],
  },
  eternia31349_divining_chambers_stay_near_monolith: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Just stay there",
    flavourText: "Do as told!",
    skill: "magic",
    weight: 6,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_magic_basics_lesson",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.MAGIC_IMBUED, "1"),
    ],
  },
  eternia31349_divining_chambers_consult_casm: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Consult with Casm",
    flavourText: "Did anything change?",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_stay_near_monolith",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_usage_basics,
      ),
    ],
  },
  eternia31349_divining_chambers_report_to_casm: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Report to Casm",
    flavourText: "Follow your teacher",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_stay_near_monolith",
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "eternia31349_divining_chambers_consult_casm",
      ),
    ],
  },
  eternia31349_divining_chambers_try_spin_beads: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Try to spin the beads",
    flavourText: "Do you really just imagine them moving around his hand?",
    skill: "magic",
    weight: 60,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_report_to_casm",
      ),
      ...NO_CASM_BEAD_RESULT,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.CASM_BEADS_BASIC, "1"),
    ],
  },
  eternia31349_divining_chambers_float_casm_beads: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Make Casm's beads float",
    flavourText: "This should be easy",
    skill: "magic",
    weight: 500,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_report_to_casm",
      ),
      CONDITION_CHECKS.skillModifier("magic", 10),
      ...NO_CASM_BEAD_RESULT,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.CASM_BEADS_IMPRESSED,
        "1",
      ),
    ],
  },
  eternia31349_divining_chambers_rotate_individual_beads: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Rotate individual beads",
    flavourText: "Being a show-off is fun",
    skill: "magic",
    weight: 3000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_report_to_casm",
      ),
      CONDITION_CHECKS.skillModifier("magic", 100),
      ...NO_CASM_BEAD_RESULT,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.CASM_BEADS_OVERACHIEVED,
        "1",
      ),
    ],
  },
  eternia31349_divining_chambers_reshape_beads: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Reshape the beads",
    flavourText: "This is probably overdoing it",
    skill: "magic",
    weight: 7500,
    ...REVEAL.skillCheck("magic", 500),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_report_to_casm",
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_SHAPER),
      ...NO_CASM_BEAD_RESULT,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.CASM_BEADS_SHOCKED, "1"),
    ],
  },
  eternia31349_divining_chambers_receive_further_guidance: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Receive further guidance",
    flavourText: "Casm is happy with your first steps",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.flag(TAGS.PANTHEON31349.CASM_BEADS_BASIC),
        CONDITION_CHECKS.flag(TAGS.PANTHEON31349.CASM_BEADS_IMPRESSED),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.studying_magic_library,
      ),
    ],
  },
  eternia31349_divining_chambers_talk_to_casm_overachieved: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Talk to Casm",
    flavourText: "He is utterly confused by how that is even possible",
    skill: "social",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.CASM_BEADS_OVERACHIEVED),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.studying_magic_library,
      ),
    ],
  },
  eternia31349_divining_chambers_talk_to_casm_shocked: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Talk to Casm",
    flavourText: "«What are you?»",
    skill: "social",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.CASM_BEADS_SHOCKED),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.studying_magic_library,
      ),
    ],
  },
  eternia31349_divining_chambers_learn_special_tomes: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Learn about special tomes",
    flavourText: "«Might as well see what it leads to»",
    skill: "perception",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_talk_to_casm_shocked",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.tomes_advanced_shaping,
      ),
    ],
  },
  eternia31349_divining_chambers_turn_in_job_posting: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Turn in job posting",
    flavourText: "Let's fight dust! You'll get Gald after you're done cleaning",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOT_JOB_OFFER_CLEANING_DIVINERS,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_receive_further_guidance",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_talk_to_casm_overachieved",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_talk_to_casm_shocked",
        ),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.READY_TO_WORK_CLEANING_DIVINERS,
        "1",
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        "0",
      ),
    ],
  },
  eternia31349_divining_chambers_manipulate_dust: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Manipulate dust",
    flavourText: "This is a lot easier!",
    skill: "magic",
    weight: 12,
    ...REVEAL.all([
      REVEAL.skillCheck("magic", 2),
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.READY_TO_WORK_CLEANING_DIVINERS,
      ),
      CONDITION_CHECKS.numFlagLTE(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        13,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        (progress) => progress + 2,
      ),
    ],
  },
  eternia31349_divining_chambers_sweep_dust: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Sweep dust",
    flavourText:
      "Search every nook and cranny for dust! The old-fashioned way",
    skill: "exploration",
    weight: 800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.READY_TO_WORK_CLEANING_DIVINERS,
      ),
      CONDITION_CHECKS.numFlagLTE(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        13,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        (progress) => progress + 1,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.DIVINERS_CLEAN_DID_MANUAL_WORK,
        "1",
      ),
    ],
  },
  eternia31349_divining_chambers_report_cleanup_magic: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Report work done",
    flavourText: "Splendid job — now you're a member of society!",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        14,
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.DIVINERS_CLEAN_DID_MANUAL_WORK,
      ),
    ],
  },
  eternia31349_divining_chambers_report_cleanup_manual: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Report work done",
    flavourText:
      "The disciples were baffled by the sight of you using a broom",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.PANTHEON31349.DIVINERS_CLEANUP_PROGRESS,
        14,
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.DIVINERS_CLEAN_DID_MANUAL_WORK,
      ),
    ],
  },
  eternia31349_divining_chambers_get_cleaning_payment: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get paid",
    flavourText: "300 Gald! Good job",
    skill: "magic",
    weight: 20,
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
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_report_cleanup_magic",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_report_cleanup_manual",
        ),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("eternia31349_gald", 300),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.DIVINERS_CLEANING_FINISHED,
        "1",
      ),
    ],
  },
};
