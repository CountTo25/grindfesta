import type { Action } from "../../types";
import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import { CROSSGEN, NO_CROSSGEN, NO_REPEAT, REPEATABLE } from "./utils";

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;
const HAS_MARCO_TOOLS_ACCESS = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_lie_device"),
  CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_explain_device"),
]);

export const marcosWorkshopActions: { [key: string]: Action } = {
  narcadia_workshop_move: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Walk to Marco's Workshop",
    skill: "exploration",
    weight: 7,
    flavourText: "Marco's Workshop — your go to place for wristwatch service",
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_workshop_search"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
    ],
  },
  narcadia_macros_chat_repairs: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about borrowing tools",
    skill: "social",
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Obviously, he wont rent out his instruments to anyone wandering by. He offered you to either pay for his services or scram, since he has work to do",
      ),
      COMPLETION_EFFECTS.addKnowledge("narcadia_currency"),
    ],
  },
  narcadia_macros_pay_charger: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Request charger upgrade",
    skill: "social",
    weight: 10,
    ...REVEAL.item("narcadia641_zenny", 3),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_chat_repairs"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 3),
      COMPLETION_EFFECTS.addLog(
        "A bit confused with offered device, Marco was able to figure out how to add a battery slot there. 'Batteries are 1 coin a pop, by the way', he informed you",
      ),
    ],
  },
  narcadia_macros_buy_battery: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Buy a battery",
    flavourText: "1 Zenny. Restores 1 energy on use",
    skill: "social",
    idx: 15,
    weight: 6,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 1),
      REVEAL.itemNotCappedYet("small_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_pay_charger"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 1),
      COMPLETION_EFFECTS.addItem("small_battery", 1),
    ],
  },
  narcadia_macros_greet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Greet the owner",
    skill: "social",
    weight: 3,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
    ],
    postComplete: [],
  },
  narcadia_macros_observe_work: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Observe Marco's work",
    skill: "engineering",
    weight: 13,
    flavourText:
      "Master is at work — fixing wristwatches. Maybe you'll notice something useful?",
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Marco is finished with repairing some old watch, replacing a battery, and goes back to reading a newspaper",
      ),
    ],
  },
  narcadia_macros_salvage_batteries: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Salvage spent batteries",
    skill: "engineering",
    flavourText:
      "Marco suggests you can treat yourself if you sort some batteries for him",
    weight: 45,
    ...REVEAL.itemNotCappedYet("small_battery"),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_observe_work"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_pay_charger"),
    ],
    postComplete: [COMPLETION_EFFECTS.addItem("small_battery", 1)],
  },
  narcadia_marco_undercharge: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about undercharged batteries",
    skill: "social",
    weight: 20,
    flavourText: "The batteries are not fully charged, right?",
    ...REVEAL.all([
      REVEAL.skillCheck("perception", 2.5),
      REVEAL.skillCheck("engineering", 1.5),
    ]),
    conditions: [
      CONDITION_CHECKS.skillModifier("perception", 1.5),
      CONDITION_CHECKS.skillModifier("engineering", 1.2),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_observe_work"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Surprised by your remark, Marco says that his charger is a bit broken, but he will new one from delivery a bit later",
      ),
      COMPLETION_EFFECTS.addKnowledge("marco_needs_charger"),
    ],
  },
  narcadia_macro_deliver_charger: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Deliver new charger",
    skill: "social",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.flag("marco_charger_on_hand"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "With new battery charger set up, it seems Marco is quite happy to provide you new services",
      ),
      COMPLETION_EFFECTS.addFlag("narcadia_delivery_finished", "1"),
      COMPLETION_EFFECTS.removeFlag("narcadia_delivery_active_order"),
      COMPLETION_EFFECTS.removeFlag("marco_charger_on_hand"),
    ],
  },
  na641_marco_ask_about_professor_naoto: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "See if Marco knows Naoto",
    skill: "social",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macro_deliver_charger"),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_lead),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
    ],
  },
  narcadia_marco_buy_supercharged_batteries: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Purchase supercharged battery",
    flavourText: "4 Zenny per piece. Restores 2 energy",
    skill: "social",
    idx: 10,
    weight: 25,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 4),
      REVEAL.itemNotCappedYet("charged_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macro_deliver_charger"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_pay_charger"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 4),
      COMPLETION_EFFECTS.addItem("charged_battery", 1),
    ],
  },
  narcadia_marco_more_upgrades: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about further upgrades",
    skill: "social",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macro_deliver_charger"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_pay_charger"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "To upgrade something, you need to understand what exactly are you upgrading, tells you Marco",
      ),
    ],
  },
  narcadia_marco_explain_device: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Tell Marco about time leap",
    skill: "social",
    weight: 30,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_more_upgrades"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_lie_device"),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Despite questioning your sanity, Marco agreed to let you use his in-store tools if you let him watch",
      ),
    ],
  },
  narcadia_marco_lie_device: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Lie about your device",
    skill: "social",
    weight: 1500,
    ...REVEAL.all([
      REVEAL.skillCheck("social", 100),
      REVEAL.skillCheck("engineering", 150),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_more_upgrades"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_explain_device"),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Seems like he believed your story about this being elaborate prototype of portable phone",
      ),
      COMPLETION_EFFECTS.addLog(
        "If you pay him 25 Zenny, he'll let you use his tools",
      ),
    ],
  },
  narcadia_stabilize_timeleap_energy: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Tinker with Time Leap Device energy module",
    skill: "engineering",
    flavourText:
      "With tools now available for you, you can start to tinker. Halves energy decay rate",
    weight: 150,
    ...REVEAL.skillCheck("engineering", 5),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      HAS_MARCO_TOOLS_ACCESS,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Energy decay seems to have stabilized for now",
      ),
      COMPLETION_EFFECTS.cutDecay(2),
    ],
  },
  na641_marcos_ask_solar_charger: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Discuss solar-powered radio",
    skill: "social",
    weight: 500,
    flavourText: "Maybe it radio can be repurposed",
    ...REVEAL.skillCheck("engineering", 30),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.skillModifier("engineering", 20),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "TODO: Marco talks through making the radio into a portable battery charger",
      ),
    ],
  },
  na641_marcos_modify_solar_radio: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Modify solar-powered radio",
    skill: "engineering",
    weight: 500,
    flavourText: "TODO: make the solar-powered radio charge the device",
    ...REVEAL.skillCheck("engineering", 30),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.skillModifier("engineering", 20),
      CONDITION_CHECKS.ifActionCompleteRun("na641_marcos_ask_solar_charger"),
      CONDITION_CHECKS.noFlag(TAGS.NA641.RADIO.CHARGER_MODIFIED),
      HAS_MARCO_TOOLS_ACCESS,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.RADIO.CHARGER_MODIFIED,
        "1",
      ),
      COMPLETION_EFFECTS.addLog(
        "TODO: modified the radio into a portable battery charger",
      ),
    ],
  },
  na641_marcos_amplify_solar_radio: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Modify Solar-powered radio speaker",
    flavourText: "Radically improve sound output power",
    skill: "engineering",
    weight: 2500,
    ...REVEAL.skillCheck("engineering", 50),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.scaring_off_lizard),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.noFlag(TAGS.NA641.RADIO.SPEAKER_AMPLIFIED),
      HAS_MARCO_TOOLS_ACCESS,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.RADIO.SPEAKER_AMPLIFIED, "1"),
    ],
  },
  narcadia_workshop_leave: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave Marco's Workshop",
    skill: "exploration",
    weight: 5,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
    ],
  },
  na641_seek_workshop: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for some workshop",
    flavourText:
      "Your time leap device seems to be off. Probably should find some repair store",
    skill: "perception",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      (d) => d.data.global.loop >= 1,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "There is advert about watchmaker shop being located nearby",
      ),
    ],
  },
  narcadia_workshop_search: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Locate workshop",
    skill: "exploration",
    flavourText: "Maybe you can find some way to fix your device there",
    weight: 15,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteAny("na641_seek_workshop"),
    ],
    postComplete: [],
  },
  na641_marcos_fix_camera_did_delivery: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask if Marco can fix this camera",
    skill: "social",
    flavourText: "Might come in handy",
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macro_deliver_charger"),
      CONDITION_CHECKS.hasItem("na641_broken_camera", 1),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_marcos_fix_camera_no_delivery",
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Either you can use his spare tools or pay 5 Zenny for a fix",
      ),
    ],
    weight: 20,
  },
  na641_marcos_fix_camera_no_delivery: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask if Marco can fix this camera",
    skill: "social",
    flavourText: "Might come in handy",
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("narcadia_macro_deliver_charger"),
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_marcos_fix_camera_did_delivery",
        ),
      ),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
      CONDITION_CHECKS.hasItem("na641_broken_camera", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("For 10 Zenny he will make it work again"),
    ],
    weight: 20,
  },
  na641_marcos_do_fix_camera_no_delivery: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pay for camera repairs",
    skill: "social",
    flavourText: "10 Zenny",
    ...REVEAL.item("narcadia641_zenny", 10),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_marcos_fix_camera_no_delivery",
      ),
      CONDITION_CHECKS.hasItem("na641_broken_camera", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 10),
      COMPLETION_EFFECTS.removeItem("na641_broken_camera", 1),
      COMPLETION_EFFECTS.addItem("na641_fixed_camera", 5),
    ],
    weight: 20,
  },
  na641_marcos_diy_fix_camera: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Fix the camera",
    flavourText: "With a few pointers from Marco it seems pretty doable",
    skill: "engineering",
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_marcos_fix_camera_did_delivery",
      ),
      CONDITION_CHECKS.hasItem("na641_broken_camera", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_broken_camera", 1),
      COMPLETION_EFFECTS.addItem("na641_fixed_camera", 5),
    ],
    weight: 150,
  },
  na641_marcos_cheap_fix_camera: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pay for camera repairs",
    skill: "social",
    ...REVEAL.item("narcadia641_zenny", 5),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.marcosWorkshop),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_marcos_fix_camera_did_delivery",
      ),
      CONDITION_CHECKS.hasItem("na641_broken_camera", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 1),
      COMPLETION_EFFECTS.removeItem("na641_broken_camera", 1),
      COMPLETION_EFFECTS.addItem("na641_fixed_camera", 5),
    ],
    weight: 30,
  },
};
