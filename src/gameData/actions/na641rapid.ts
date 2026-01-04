import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
import { DELIVERY_TAGS, KNOWLEDGE } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const rapidDeliver = () => [
  COMPLETION_EFFECTS.addFlag("narcadia_delivery_finished", "1"),
  COMPLETION_EFFECTS.removeFlag("narcadia_delivery_active_order"),
];

const turnInDelivery = () => [
  COMPLETION_EFFECTS.removeFlag("narcadia_delivery_finished"),
  COMPLETION_EFFECTS.addItem("narcadia641_zenny", 2),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_seek_init"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Western main street")],
  },
  narcadia_delivery_promo: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get to know about best delivery service",
    skill: "social",
    flavourText: "Promoter standing outside if VERY insistent",
    weight: 15,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_promo"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Payment is 2 Zeny per delivery, but you'll need to show that you have some knowledge about local area"
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_promo"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_job"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("You can take on delivery jobs from now on"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.flag("narcadia_delivery_active_order"),
      CONDITION_CHECKS.noFlag("marco_charger_on_hand"),
      CONDITION_CHECKS.noFlag("na641_marco_delivery_lock"),
      CONDITION_CHECKS.noFlag(DELIVERY_TAGS.junk_delivery),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
    ],
    postComplete: turnInDelivery(),
  },
};
