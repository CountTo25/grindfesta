import type { Action } from "../../types";
import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

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
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Payment is 2 Zeny per delivery, but you'll need to show that you have some knowledge about local area"
      ),
    ],
  },
  narcadia_delivery_macros_charger: {
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
      CONDITION_CHECKS.ifActionCompleteAny(
        "narcadia_delivery_find_marco_order"
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "You've picked up Marco's charger for delivery. Could that help?"
      ),
    ],
  },
  narcadia_delivery_find_marco_order: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for Marco's charger order",
    skill: "perception",
    weight: 30,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Rapid Delivery Service"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_delivery_take_job"),
      CONDITION_CHECKS.hasKnowledge("marco_needs_charger"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "You've picked up Marco's charger for delivery. Could that help?"
      ),
    ],
  },
};
