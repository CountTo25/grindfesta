import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;

export const na641junkActions: ActionRepository = {
  narcadia641_leave_junk: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave junk shop",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
  },
  narcadia_junk_greet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get to know the owner",
    skill: "social",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "You're free to browse and pick up whatever you might need",
      ),
    ],
  },
  na641_junk_junkbin_look: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Go over junk bin",
    skill: "perception",
    weight: 25,
    conditions: [
      CONDITION_CHECKS.numFlagLTE("na641_rummage_junk", 5),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_junk_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.if(
        (d) =>
          Number.parseInt(d.data.run.flags["na641_rummage_junk"] ?? "0") >= 5,
        COMPLETION_EFFECTS.addLog(
          "Seems like there is nothing left in this bin. Probably should look around the store?",
        ),
      ),
      COMPLETION_EFFECTS.patchFlagNumeric("na641_rummage_junk", (v) => ++v),
    ],
  },
  na641_junk_buy_wallet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...REVEAL.all([REVEAL.item("narcadia641_zenny", 7)]),
    title: "Purchase worn wallet",
    flavourText:
      "7 Zenny. A bit holey, but still useable. Expands Zenny inventory by 10",
    skill: "social",
    idx: 10,
    weight: 6,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.numFlagGTE("na641_rummage_junk", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 7),
      COMPLETION_EFFECTS.addFlag(TAGS.MODIFIERS.HAS_JUNK_WALLET, "true"),
    ],
  },
  na641_junk_figure_radio_out: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...REVEAL.all([REVEAL.skillCheck("engineering", 4)]),
    title: "Figure out whats wrong with radio",
    flavourText: "A broken radio. Maybe it could still be fixed?",
    skill: "engineering",
    idx: 10,
    weight: 70,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.numFlagGTE("na641_rummage_junk", 3),
    ],
    postComplete: [],
  },
  na641_junk_ask_about_radio: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask Anna about fixable radio",
    skill: "social",
    idx: 10,
    weight: 50,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.ifActionCompleteAny("na641_junk_figure_radio_out"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("na641_annas_repair_job"),
    ],
  },
  na641_junk_fix_pile: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    ...REVEAL.itemNotCappedYet("narcadia641_zenny"),
    title: "Try to fix some of the junk",
    skill: "engineering",
    flavourText: "3 Zenny per fixed good",
    idx: 10,
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.ifActionCompleteRun("na641_junk_ask_about_radio"),
      CONDITION_CHECKS.numFlagLTE(TAGS.NA641.JUNK.FIX_COUNT, 9),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 3),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.JUNK.FIX_COUNT,
        (v) => ++v,
      ),
      COMPLETION_EFFECTS.if(
        CONDITION_CHECKS.numFlagGTE(TAGS.NA641.JUNK.FIX_COUNT, 10),
        COMPLETION_EFFECTS.addLog(
          "You finished fixing everything that looked fixable",
        ),
      ),
    ],
  },
  na641_junk_one_time_camera: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...REVEAL.all([REVEAL.item("narcadia641_zenny", 1)]),
    title: "Buy broken instant camera",
    flavourText: "1 Zenny. Should've thrown it out",
    skill: "social",
    idx: 10,
    weight: 35,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.numFlagGTE("na641_rummage_junk", 5),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("na641_broken_camera", 1),
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 1),
    ],
  },
  na641_junk_inspect_display: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Inspect display",
    skill: "perception",
    flavourText:
      "Stuff that Anna is proud of. Proudness directly corelates to price",
    weight: 50,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_junk_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Theres quite a bit of good things for sale, if you have coins for it",
      ),
    ],
  },
  na641_junk_buy_clanky_mini_printer: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Purchase clanky mini-printer",
    flavourText: "Decommissioned. Same model as City Hall uses!",
    skill: "social",
    weight: 450,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 30),
      REVEAL.itemNotCappedYet("na641_clanky_mini_printer"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.ifActionCompleteAny("na641_junk_inspect_display"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_junk_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 30),
      COMPLETION_EFFECTS.addItem("na641_clanky_mini_printer", 1),
    ],
  },
  narcadia_junk_deliver_order: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Deliver box of junk",
    skill: "social",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.annasRecycledGoods),
      CONDITION_CHECKS.flag(TAGS.NA641.DELIVERY.junk_delivery),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_junk_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "What was inside the box is a mystery — probably just a bunch of junk",
      ),
      COMPLETION_EFFECTS.addFlag("narcadia_delivery_finished", "1"),
      COMPLETION_EFFECTS.removeFlag("narcadia_delivery_active_order"),
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.DELIVERY.junk_delivery),
    ],
  },
};
