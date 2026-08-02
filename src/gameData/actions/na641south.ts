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

export const na641southActions: ActionRepository = {
  narcadia641_outskirts_move: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Move to southern outskirts",
    skill: "exploration",
    weight: 75,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.southern_outskirts),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
  },
  narcadia641_outskirts_leave_naws: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Move to Western Main Street",
    skill: "exploration",
    weight: 75,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
    ],
  },
  narcadia641_ss_outskirts_find_stores: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check out local shops",
    skill: "perception",
    weight: 80,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.junk_shop_location),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.junk_shop_location),
    ],
  },
  narcadia641_goto_junk: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Anna's Recycled Goods",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.junk_shop_location),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
    ],
  },
  na641_johnny_meet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Meet Johnny",
    skill: "social",
    weight: 70,
    ...REVEAL.skillCheck("social", 12),
    conditions: [
      CONDITION_CHECKS.skillModifier("social", 3),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.johnny_contact),
    ],
    postComplete: COMPLETION_EFFECTS.addLog(
      "The fabled mr. Questionable Jobs himself!",
    ),
  },
  na641_johnny_talk: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Talk to Johnny",
    skill: "social",
    weight: 45,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_meet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.johnny_jobs),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.johnny_marco_beef),
      COMPLETION_EFFECTS.addLog(
        "Since you were referred by a mutual contact, Johnny is willing to share some of his job leads with you",
      ),
      COMPLETION_EFFECTS.addLog(
        "His cut is 70%. Deal with it. Available jobs are NAWS 'pickup' and Marko intimidation",
      ),
    ],
  },
  na641_johnny_take_museum_job: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Take on Museum Job",
    skill: "social",
    weight: 15,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.johnny_jobs),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_talk"),
      CONDITION_CHECKS.noFlag(TAGS.NA641.JOHNNY.MUSEUM_JOB),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.JOHNNY.MUSEUM_JOB, "1"),
      COMPLETION_EFFECTS.addLog(
        "Some freak wants to get ancient bones for his personal collection. ",
      ),
    ],
  },
  na641_johnny_turn_in_procured_goods: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Turn in procured goods",
    flavourText: "At least you aren't becoming a criminal in your own time",
    skill: "social",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.JOHNNY.MUSEUM_JOB),
      CONDITION_CHECKS.hasItem("anchor_ancient_bone", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("anchor_ancient_bone", 1),
      COMPLETION_EFFECTS.fillItemToCapacity("narcadia641_zenny"),
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.JOHNNY.MUSEUM_JOB),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.REPUTATION.UNDERWORLD,
        (reputation) => reputation + 5,
      ),
      COMPLETION_EFFECTS.addLog(
        "You're now officially part of Arcadia's underworld. And you've got quite some money!",
      ),
    ],
  },
  na641_johnny_turn_in_weird_skull: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Try to hand off skull",
    flavourText: "Lets see if you can satisfy him with this",
    skill: "social",
    weight: 1200,
    ...REVEAL.skillCheck("social", 75),
    conditions: [
      CONDITION_CHECKS.skillModifier("social", 10),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.JOHNNY.MUSEUM_JOB),
      CONDITION_CHECKS.hasItem("bbasin7281_weird_skull", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("bbasin7281_weird_skull", 1),
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.JOHNNY.MUSEUM_JOB),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.REPUTATION.UNDERWORLD,
        (reputation) => reputation + 3,
      ),
      COMPLETION_EFFECTS.addLog(
        "Johnny accepts your 'lucky find' in place of requested artifact. No money for you, but he is interested in your improvisation skills",
      ),
    ],
  },
  na641_johnny_take_setup_job: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Take on setup job",
    flavourText:
      "Some guy crossed Johnny — lets help him chill in prison for a bit",
    skill: "social",
    weight: 400,
    ...REVEAL.skillCheck("social", 1),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_johnny_turn_in_procured_goods",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_johnny_turn_in_weird_skull",
        ),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("na641_johnnys_special_envelope", 1),
    ],
  },
};
