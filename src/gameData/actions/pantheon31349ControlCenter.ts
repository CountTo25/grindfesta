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

const ETERNIA31349 = LOCATIONS.eternia31349;
const CONTROL_CENTER = SUBLOCATIONS.eternia31349.controlDistrictControlCenter;

const IN_CONTROL_CENTER = [
  CONDITION_CHECKS.inLocation(ETERNIA31349),
  CONDITION_CHECKS.inSubLocation(CONTROL_CENTER),
];

export const pantheon31349ControlCenterActions: ActionRepository = {
  eternia31349_control_center_greet_staff: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Greet staff",
    flavourText:
      "A lot of people are working here to ensure Eternia operates smoothly",
    skill: "social",
    weight: 1500,
    conditions: IN_CONTROL_CENTER,
  },
  eternia31349_control_center_ask_about_control: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about Control",
    flavourText: "What exactly is being controlled here?",
    skill: "social",
    weight: 1550,
    conditions: [
      ...IN_CONTROL_CENTER,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_control_center_greet_staff",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.control_operations,
      ),
    ],
  },
  eternia31349_control_center_meet_control_head: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Meet Control head",
    flavourText: "The leader herself is rather curious about you",
    skill: "social",
    weight: 1600,
    conditions: [
      ...IN_CONTROL_CENTER,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_control_center_greet_staff",
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "eternia31349_control_center_ask_about_control",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.control_head,
      ),
    ],
  },
  eternia31349_control_center_swarm_lana_with_questions: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Swarm Lana with questions",
    flavourText: "What goes into managing Eternia?",
    skill: "social",
    weight: 1650,
    conditions: [
      ...IN_CONTROL_CENTER,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_control_center_meet_control_head",
      ),
    ],
  },
  eternia31349_control_center_agree_to_run_errands: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Agree to run errands",
    flavourText:
      "Such a curious being as you — shame not to put you to work. Also gives an opportunity to learn!",
    skill: "social",
    weight: 1700,
    conditions: [
      ...IN_CONTROL_CENTER,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_control_center_swarm_lana_with_questions",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.CONTROL_JOBS, "1"),
    ],
  },
  eternia31349_control_center_take_documents_delivery: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Take on documents delivery to Defense District",
    flavourText: "Great way to get familiar with the last sector of Eternia!",
    skill: "social",
    weight: 1750,
    ...REVEAL.all([
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
      REVEAL.runFlag(
        TAGS.PANTHEON31349.BANK_ACCOUNT_INFO,
        "Requires a bank account",
      ),
    ]),
    conditions: [
      ...IN_CONTROL_CENTER,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.CONTROL_JOBS),
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.HAS_DOCUMENT_DELIVERY_CONTROL,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.HAS_DOCUMENT_DELIVERY_CONTROL,
        "1",
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.defense_district,
      ),
    ],
  },
};
