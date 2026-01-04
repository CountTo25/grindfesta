import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { DELIVERY_TAGS, KNOWLEDGE } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

export const na641southActions: ActionRepository = {
  narcadia641_outskirts_move: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Move to southern outskirts",
    skill: "exploration",
    weight: 75,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.southern_outskirts),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation("Southern main street outskirts"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Southern main street outskirts"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Western main street")],
  },
  narcadia641_ss_outskirts_find_stores: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check out local shops",
    skill: "perception",
    weight: 80,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Southern main street outskirts"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.junk_shop_location)
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Southern main street outskirts"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Anna's Recycled Goods")],
  },
};
