import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { DELIVERY_TAGS, KNOWLEDGE } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;
const HAS_DELIVERED_FOUR_ORDERS = CONDITION_CHECKS.numFlagGTE(
  "narcadia_delivery_count",
  4,
);

const rapidDeliver = () => [
  COMPLETION_EFFECTS.addFlag("narcadia_delivery_finished", "1"),
  COMPLETION_EFFECTS.removeFlag("narcadia_delivery_active_order"),
];

const turnInDelivery = () => [
  COMPLETION_EFFECTS.removeFlag("narcadia_delivery_finished"),
  COMPLETION_EFFECTS.addItem("narcadia641_zenny", 3),
  COMPLETION_EFFECTS.patchFlagNumeric("narcadia_delivery_count", (v) => ++v),
];

export const rapidDeliveryActions: ActionRepository = {
  narcadia_delivery_move: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Go to delivery center",
    skill: "exploration",
    weight: 7,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_seek_init"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
    ],
  },
  narcadia_delivery_leave: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to main street",
    skill: "exploration",
    weight: 5,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet)],
  },
  narcadia_delivery_promo: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get to know about best delivery service",
    skill: "social",
    flavourText: "Promoter standing outside if VERY insistent",
    weight: 15,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "After a lot of pointless blabbering, you got to know that Rapid is indeed fast. You can either look for work or make a delivery request here"
      ),
      COMPLETION_EFFECTS.addKnowledge("narcadia_currency"),
    ],
  },
  narcadia_delivery_job: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about job openings",
    skill: "social",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_promo"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Payment is 3 Zenny per delivery, but you'll need to show that you have some knowledge about local area"
      ),
    ],
  },
  narcadia_delivery_take_job: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Agree to Rapid's deliveryman terms",
    skill: "social",
    weight: 20,
    ...REVEAL.hasKnowledge("narcadia_west_main_street_acchikocchi"),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_promo"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_job"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("na641_rapid_delivery_job"),
    ],
  },
  na641_delivery_talk_to_manager: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Talk to manager",
    flavourText: "You're up for promotion!",
    skill: "social",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.numFlagGTE("narcadia_delivery_count", 10),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.advanced_access),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.advanced_access, "1"),
      COMPLETION_EFFECTS.reachMilestone("na641_rapid_delivery_promotion"),
    ],
  },
  na641_delivery_ask_for_johnnys_package: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask to deliver Johnny's Special Package",
    skill: "social",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_take_setup_job"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.not(HAS_DELIVERED_FOUR_ORDERS),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.active_order),
      CONDITION_CHECKS.noFlag("narcadia_delivery_finished"),
    ],
    postComplete: [],
  },
  na641_delivery_pick_up_compromised_package: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pick up to-be-compromised package",
    flavourText: "Target is in Southern Main Street",
    skill: "exploration",
    weight: 50,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_take_setup_job"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.active_order),
      CONDITION_CHECKS.noFlag("narcadia_delivery_finished"),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_delivery_ask_for_johnnys_package",
        ),
        HAS_DELIVERED_FOUR_ORDERS,
      ]),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("na641_to_be_compromised_package", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("na641_to_be_compromised_package", 1),
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.active_order, "1"),
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.johnny_setup_delivery, "1"),
    ],
  },
  na641_delivery_slide_envelope_into_package: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Slide in envelope",
    flavourText: "You need to be real careful to not make it look suspicious",
    skill: "perception",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_delivery_pick_up_compromised_package",
      ),
      CONDITION_CHECKS.hasItem("na641_to_be_compromised_package", 1),
      CONDITION_CHECKS.hasItem("na641_johnnys_special_envelope", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_to_be_compromised_package", 1),
      COMPLETION_EFFECTS.removeItem("na641_johnnys_special_envelope", 1),
      COMPLETION_EFFECTS.addItem("na641_compromised_package", 1),
    ],
  },
  na641_delivery_hack_terminal: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Hack into terminal",
    flavourText: "Now lets see where they are kept",
    skill: "perception",
    weight: 900,
    ...REVEAL.skillCheck("engineering", 60),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.blank_ids_sources),
    ],
    postComplete: [],
  },
  na641_delivery_give_yourself_promotion: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Give yourself a promotion",
    flavourText: "More deliveries, more permissions. A bit shady",
    skill: "engineering",
    weight: 1100,
    ...REVEAL.skillCheck("engineering", 70),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("na641_delivery_hack_terminal"),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.advanced_access),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.advanced_access, "1"),
      COMPLETION_EFFECTS.reachMilestone(
        "na641_rapid_delivery_forged_promotion",
      ),
    ],
  },
  na641_delivery_find_professor_naoto: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for Naoto in delivery records",
    skill: "perception",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.flag(DELIVERY_TAGS.advanced_access),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_lead),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.professor_naoto_house),
    ],
  },
  na641_delivery_visit_special_storage: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit special delivery storage",
    skill: "exploration",
    weight: 850,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.flag(DELIVERY_TAGS.advanced_access),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.blank_ids_sources),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.rapidDeliverySpecialStorage,
      ),
    ],
  },
  na641_delivery_find_blank_ids: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Find blank IDs",
    skill: "perception",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.rapidDeliverySpecialStorage,
      ),
    ],
    postComplete: [],
  },
  na641_delivery_damage_blank_id_case: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Damage the case",
    flavourText: "Let's make this look like an accident",
    skill: "engineering",
    weight: 700,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.rapidDeliverySpecialStorage,
      ),
      CONDITION_CHECKS.ifActionCompleteAny("na641_delivery_find_blank_ids"),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.taking_all_blank_ids_bad_idea,
      ),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.took_all_the_ids),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.damaged_blank_id_case),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        DELIVERY_TAGS.damaged_blank_id_case,
        "1",
      ),
    ],
  },
  na641_delivery_take_blank_id_shipment: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get your hands on blanks",
    flavourText: "Here they are",
    skill: "exploration",
    weight: 250,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.rapidDeliverySpecialStorage,
      ),
      CONDITION_CHECKS.ifActionCompleteAny("na641_delivery_find_blank_ids"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("na641_blank_id_shipment", 1),
      ),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.damaged_blank_id_case),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("na641_blank_id_shipment", 1),
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.took_all_the_ids, "1"),
    ],
  },
  na641_delivery_take_single_blank_id: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pick up single blank",
    flavourText: "Let's not overdo it",
    skill: "exploration",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.rapidDeliverySpecialStorage,
      ),
      CONDITION_CHECKS.flag(DELIVERY_TAGS.damaged_blank_id_case),
      CONDITION_CHECKS.not(CONDITION_CHECKS.hasItem("na641_blank_id", 1)),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("na641_blank_id", 1),
    ],
  },
  na641_delivery_leave_special_storage: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Rapid Delivery Service",
    skill: "exploration",
    weight: 30,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.rapidDeliverySpecialStorage,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
    ],
  },
  narcadia_delivery_take_order: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Take on a delivery order",
    skill: "social",
    weight: 5,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.noFlag("narcadia_delivery_active_order"),
      CONDITION_CHECKS.noFlag("narcadia_delivery_finished"),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag("narcadia_delivery_active_order", "1"),
      COMPLETION_EFFECTS.addLog(
        "Customer is somewhere around Western Main Street"
      ),
    ],
  },
  narcadia_delivery_take_junk_order: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Deliver to junk shop",
    flavourText: "A special delivery — an order for local trinket seller",
    skill: "social",
    weight: 5,
    conditions: [
      CONDITION_CHECKS.numFlagGTE("narcadia_delivery_count", 5),
      CONDITION_CHECKS.noFlag("narcadia_delivery_active_order"),
      CONDITION_CHECKS.noFlag("narcadia_delivery_finished"),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.junk_delivery, "1"),
      COMPLETION_EFFECTS.addFlag(DELIVERY_TAGS.active_order, "1"),
      COMPLETION_EFFECTS.addLog(
        "Customer is somewhere around Western Main Street"
      ),
    ],
  },
  narcadia_delivery_marcos_charger: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Take on Marco's charger delivery",
    skill: "social",
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.hasKnowledge("marco_needs_charger"),
      CONDITION_CHECKS.noFlag("narcadia_delivery_active_order"),
      CONDITION_CHECKS.noFlag("narcadia_delivery_finished"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "You've agreed to pick up Macro's order for delivery. Now to find it"
      ),
      COMPLETION_EFFECTS.addFlag("narcadia_delivery_active_order", "1"),
      COMPLETION_EFFECTS.addFlag("na641_marco_delivery_lock", "1"),
    ],
  },
  narcadia_delivery_find_marco_order: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for Marco's charger order",
    skill: "perception",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.hasKnowledge("marco_needs_charger"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_marcos_charger"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag("marco_charger_on_hand", "1"),
      COMPLETION_EFFECTS.removeFlag("na641_marco_delivery_lock"),
      COMPLETION_EFFECTS.addLog(
        "Now all that's left is to deliver it to Marco at his workshop"
      ),
      COMPLETION_EFFECTS.addKnowledge("narcadia641_macro_charger_location"),
    ],
  },
  narcadia_delivery_grab_macro_order: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pickup Marco's charger",
    flavourText: "You know where the lost charger is. Just grab it",
    skill: "exploration",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.hasKnowledge("marco_needs_charger"),
      CONDITION_CHECKS.hasKnowledge("narcadia641_macro_charger_location"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_marcos_charger"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "narcadia_delivery_find_marco_order"
        )
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag("marco_charger_on_hand", "1"),
      COMPLETION_EFFECTS.addLog(
        "Now all that's left is to deliver it to Marco at his workshop"
      ),
      COMPLETION_EFFECTS.removeFlag("na641_marco_delivery_lock"),
      COMPLETION_EFFECTS.addKnowledge("narcadia641_macro_charger_location"),
    ],
  },
  narcadia_delivery_deliver: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Deliver an order",
    skill: "exploration",
    weight: 30,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.flag("narcadia_delivery_active_order"),
      CONDITION_CHECKS.noFlag("marco_charger_on_hand"),
      CONDITION_CHECKS.noFlag("na641_marco_delivery_lock"),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.junk_delivery),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.johnny_setup_delivery),
    ],
    postComplete: [
      ...rapidDeliver(),
      COMPLETION_EFFECTS.addLog("Report your delivery to local Rapid office"),
    ],
  },
  narcadia_delivery_find_junk_store: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for a junk store",
    skill: "exploration",
    weight: 100,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.flag(DELIVERY_TAGS.active_order),
      CONDITION_CHECKS.flag(DELIVERY_TAGS.junk_delivery),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.junk_shop_location)
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.junk_shop_location),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.southern_outskirts),
      COMPLETION_EFFECTS.addLog(
        "Apparently you'll have to go via outskirts to shady street connecting Western and Southern main streets"
      ),
    ],
  },
  narcadia_delivery_turn_in_order: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Report finished order",
    skill: "social",
    weight: 5,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.noFlag("narcadia_delivery_active_order"),
      CONDITION_CHECKS.flag("narcadia_delivery_finished"),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.rapidDeliveryService),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
    ],
    postComplete: turnInDelivery(),
  },
};
