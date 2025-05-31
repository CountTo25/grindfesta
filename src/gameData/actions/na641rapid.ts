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
};
