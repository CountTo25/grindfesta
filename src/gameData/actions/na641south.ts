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
      COMPLETION_EFFECTS.reachMilestone(
        "na641_visit_annas_recycled_goods",
      ),
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
      CONDITION_CHECKS.ifActionCompleteRun("na641_homeless_wistom"),
    ],
    postComplete: COMPLETION_EFFECTS.reachMilestone("na641_meet_johnny"),
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
      COMPLETION_EFFECTS.addLog(
        "Since you were referred by a mutual contact, Johnny is willing to share some of his job leads with you",
      ),
      COMPLETION_EFFECTS.addLog(
        "His cut is 70%. Deal with it. First up is a NAWS 'pickup' — an ancient bone for a private collector",
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
  na641_johnny_report_package_job: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Report package job",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_leatherworks_deliver_special_package",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 10),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.REPUTATION.UNDERWORLD,
        (reputation) => reputation + 3,
      ),
    ],
  },
  na641_johnny_turn_in_information_report: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Turn in report",
    skill: "social",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.hasItem("na641_johnny_information_report", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_johnny_information_report", 1),
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 5),
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.JOHNNY.INFORMATION_AMASSED,
      ),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.JOHNNY.INFORMATION_REPORTS,
        (reports) => reports + 1,
      ),
      COMPLETION_EFFECTS.if(
        (state) =>
          Number.parseInt(
            state.data.run.flags[
              TAGS.NA641.JOHNNY.INFORMATION_REPORTS
            ] ?? "0",
          ) % 2 ===
          0,
        COMPLETION_EFFECTS.patchFlagNumeric(
          TAGS.NA641.REPUTATION.UNDERWORLD,
          (reputation) => reputation + 1,
        ),
      ),
    ],
  },
  na641_johnny_hear_him_out: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Hear Johnny out",
    flavourText: "He wants you to join his gang — officially",
    skill: "social",
    weight: 600,
    ...REVEAL.skillCheck("social", 30),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.numFlagGTE(TAGS.NA641.REPUTATION.UNDERWORLD, 10),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("na641_join_johnnys_gang"),
    ],
  },
  na641_johnny_enter_gang_hideout: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Enter Johnny's Gang Hideout",
    skill: "exploration",
    weight: 50,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_hear_him_out"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
    ],
  },
  na641_johnny_meet_gang: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Meet the gang",
    flavourText: "Meet Erika and Vitya",
    skill: "social",
    weight: 350,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Erika handles forgery and Vitya sells questionable goods. You'll fit right in!",
      ),
    ],
  },
  na641_erika_ask_about_fake_id: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask Erika about producing fake ID",
    skill: "social",
    weight: 400,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_meet_gang"),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.city_hall_requires_identification,
      ),
      CONDITION_CHECKS.hasItem("na641_clanky_mini_printer", 1),
    ],
    postComplete: [],
  },
  na641_erika_ask_about_top_layer: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask Erika about getting to top layer",
    skill: "social",
    weight: 250,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_meet_gang"),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.city_hall_requires_identification,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("na641_clanky_mini_printer", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "She strongly suggests looking around Anna's place",
      ),
    ],
  },
  na641_erika_show_mini_printer: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Show mini-printer to Erika",
    flavourText: "Lets go illegal all the way",
    skill: "social",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_erika_ask_about_fake_id"),
      CONDITION_CHECKS.hasItem("na641_clanky_mini_printer", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.blank_id_cards),
      COMPLETION_EFFECTS.addLog(
        "Now you'll need to procure blanks. Vitya might know more!",
      ),
    ],
  },
  na641_vitya_request_blank_id_info: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Request info on blank IDs",
    skill: "social",
    weight: 650,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_meet_gang"),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.blank_id_cards),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Sure. That info will cost. 35 Zenny, to be exact",
      ),
    ],
  },
  na641_vitya_buy_blank_id_info: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy blank ID info",
    skill: "social",
    weight: 100,
    ...REVEAL.item("narcadia641_zenny", 35),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_vitya_request_blank_id_info",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 35),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.blank_ids_sources),
      COMPLETION_EFFECTS.addLog(
        "There is a shipment in Rapid waiting to be transferred to City Hall",
      ),
    ],
  },
  na641_vitya_find_professor_naoto: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Request Vitya to find Naoto",
    flavourText: "20 Zenny per lookup",
    skill: "social",
    weight: 500,
    ...REVEAL.item("narcadia641_zenny", 20),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_meet_gang"),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_lead),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 20),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
    ],
  },
  na641_erika_turn_in_blank_ids: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Turn in blanks to Erika",
    flavourText: "She looks at you taken aback",
    skill: "social",
    weight: 500,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_erika_show_mini_printer"),
      CONDITION_CHECKS.hasItem("na641_blank_id_shipment", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_blank_id_shipment", 1),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.taking_all_blank_ids_bad_idea,
      ),
      COMPLETION_EFFECTS.decreaseFlagNumeric(
        TAGS.NA641.REPUTATION.UNDERWORLD,
        5,
        10,
      ),
      COMPLETION_EFFECTS.addLog(
        "Apparently nabbing the whole batch is a super bad idea. Let's try something else next time",
      ),
    ],
  },
  na641_erika_give_single_blank_id: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Give a blank to Erika",
    flavourText: "Now let's make an ID",
    skill: "social",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.ifActionCompleteRun("na641_erika_show_mini_printer"),
      CONDITION_CHECKS.hasItem("na641_blank_id", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_blank_id", 1),
    ],
  },
  na641_erika_produce_fake_id: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Produce a convincing ID",
    flavourText: "Cooperation is the key!",
    skill: "engineering",
    weight: 1600,
    ...REVEAL.skillCheck("engineering", 90),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_erika_give_single_blank_id",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_erika_turn_in_blank_ids",
        ),
      ]),
      CONDITION_CHECKS.hasItem("na641_clanky_mini_printer", 1),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("new_arcadia_fake_id", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("new_arcadia_fake_id", 1),
      COMPLETION_EFFECTS.reachMilestone("na641_produce_fake_id"),
    ],
  },
  na641_johnny_leave_gang_hideout: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to southern outskirts",
    skill: "exploration",
    weight: 30,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.johnnysGangHideout),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
  },
};
