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
const NAOTO_CONVERSATION_FINISHED = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_ask_about_lizards"),
  CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_inquire_proto_varanidae"),
  CONDITION_CHECKS.ifActionCompleteRun(
    "na641_naoto_praise_professors_work",
  ),
]);
const NAOTO_CONVERSATION_OPEN = CONDITION_CHECKS.not(
  NAOTO_CONVERSATION_FINISHED,
);
const NAOTO_FAILED_CONVERSATION = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_ask_about_lizards"),
  CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_inquire_proto_varanidae"),
]);
const IN_NAOTO_HOUSE = [
  CONDITION_CHECKS.inLocation(NA641),
  CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.professorNaotosHouse),
];

export const professorNaotoActions: ActionRepository = {
  na641_visit_professor_naotos_house: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Professor Naoto's house",
    skill: "exploration",
    weight: 500,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.professorNaotosHouse,
      ),
    ],
  },
  na641_leave_professor_naotos_house: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Western Main Street",
    skill: "exploration",
    weight: 50,
    stopOnRepeat: true,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.flag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
        CONDITION_CHECKS.not(NAOTO_FAILED_CONVERSATION),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
    ],
  },
  na641_naoto_greet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Greet the professor",
    flavourText: "Professor is visibly irritated by someone visiting him at home",
    skill: "social",
    weight: 1550,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.noFlag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
    ],
    postComplete: [],
  },
  na641_naoto_ask_about_lizards: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about lizards",
    flavourText: "Lizards are cool!",
    skill: "social",
    weight: 1600,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_greet"),
      NAOTO_CONVERSATION_OPEN,
      CONDITION_CHECKS.not(CONDITION_CHECKS.skillModifier("social", 40)),
      CONDITION_CHECKS.noFlag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
    ],
    postComplete: [],
  },
  na641_naoto_inquire_proto_varanidae: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Inquire about proto-varanidae",
    flavourText: "Sounding smart might help",
    skill: "social",
    weight: 1600,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_greet"),
      NAOTO_CONVERSATION_OPEN,
      CONDITION_CHECKS.skillModifier("social", 40),
      CONDITION_CHECKS.not(CONDITION_CHECKS.skillModifier("social", 80)),
      CONDITION_CHECKS.noFlag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
    ],
    postComplete: [],
  },
  na641_naoto_praise_professors_work: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Praise the professor for his work sincerely",
    flavourText: "Flattery will get you everywhere",
    skill: "social",
    weight: 1600,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_greet"),
      NAOTO_CONVERSATION_OPEN,
      CONDITION_CHECKS.skillModifier("social", 80),
      CONDITION_CHECKS.noFlag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN,
        "1",
      ),
      COMPLETION_EFFECTS.reachMilestone("na641_naoto_lets_you_in"),
    ],
  },
  na641_naoto_show_lizard_photo: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Show Professor the lizard photo",
    skill: "social",
    weight: 100,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.hasItem("bbasin7281_lizard_photo", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN,
        "1",
      ),
      COMPLETION_EFFECTS.reachMilestone("na641_naoto_lets_you_in"),
    ],
  },
  na641_naoto_get_snacks: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get some snacks going",
    flavourText: "Let's request pizza via Rapid. 10 Zenny",
    skill: "social",
    weight: 900,
    ...REVEAL.item("narcadia641_zenny", 10),
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.flag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_naoto_show_lizard_photo",
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 10),
    ],
  },
  na641_naoto_ask_about_lizard_weaknesses: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask the professor about lizard weaknesses",
    flavourText: "Lets learn more",
    skill: "survival",
    weight: 100,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.flag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_naoto_show_lizard_photo",
        ),
        CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_get_snacks"),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.canyon_lizard_weak_points,
      ),
    ],
  },
  na641_naoto_explain_time_leap: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Explain time leap",
    skill: "social",
    weight: 1000,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_naoto_show_lizard_photo",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_lie_about_photo"),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("na641_naoto_knows_time_leap"),
    ],
  },
  na641_naoto_lie_about_photo: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Lie about photo",
    skill: "social",
    weight: 3000,
    ...REVEAL.skillCheck("social", 100),
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_naoto_show_lizard_photo",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_naoto_explain_time_leap",
        ),
      ),
    ],
    postComplete: [],
  },
  na641_naoto_ask_about_specimen: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about this specimen",
    flavourText:
      "With the whole photo in your hands, you can understand even more about this guy",
    skill: "survival",
    weight: 80,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_naoto_explain_time_leap",
        ),
        CONDITION_CHECKS.ifActionCompleteRun("na641_naoto_lie_about_photo"),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.scaring_off_lizard,
      ),
      COMPLETION_EFFECTS.addLog("They hate loud sounds"),
    ],
  },
  na641_naoto_discuss_further_cooperation: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Talk about further cooperation",
    flavourText:
      "«If you bring me more things from the past, I will teach you even more»",
    skill: "social",
    weight: 2000,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_naoto_explain_time_leap",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("na641_partner_with_professor_naoto"),
    ],
  },
  na641_naoto_no_new_past_items: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "«Bring more items from past»",
    flavourText:
      "Naoto is waiting for another specimen. This route continues in a future update.",
    skill: "social",
    weight: 1,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.flag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
      CONDITION_CHECKS.ifActionCompleteGlobal(
        "na641_naoto_discuss_further_cooperation",
      ),
      CONDITION_CHECKS.ifActionCompleteGlobal(
        "na641_naoto_ask_about_lizard_weaknesses",
      ),
      CONDITION_CHECKS.ifActionCompleteGlobal(
        "na641_naoto_ask_about_specimen",
      ),
    ],
    postComplete: [],
  },
  na641_naoto_leave_in_shame: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave in shame",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_naoto_ask_about_lizards",
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
    ],
  },
  na641_naoto_get_out: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Get out",
    flavourText: "Lesson-related questions have to be asked at lessons, not at home",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      ...IN_NAOTO_HOUSE,
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_naoto_inquire_proto_varanidae",
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.PROFESSOR_NAOTO.READY_TO_LISTEN),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
    ],
  },
};
