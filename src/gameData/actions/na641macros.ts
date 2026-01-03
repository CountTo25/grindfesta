import type { Action } from "../../types";
import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
import { CROSSGEN, NO_CROSSGEN, NO_REPEAT, REPEATABLE } from "./utils";

export const macrosWorkshopActions: { [key: string]: Action } = {
  narcadia_workshop_move: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Walk to Marco's Workshop",
    skill: "exploration",
    weight: 7,
    flavourText: "Marco's Workshop — your go to place for wristwatch service",
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_workshop_search"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Marco's Workshop")],
  },
  narcadia_macros_chat_repairs: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about borrowing tools",
    skill: "social",
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Obviously, he wont rent out his instruments to anyone wandering by. He offered you to either pay for his services or scram, since he has work to do"
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_chat_repairs"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 3),
      COMPLETION_EFFECTS.addLog(
        "A bit confused with offered device, Marco was able to figure out how to add a battery slot there. 'Batteries are 1 coin a pop, by the way', he informed you"
      ),
    ],
  },
  narcadia_macros_buy_battery: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Buy a battery",
    skill: "social",
    weight: 6,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 1),
      REVEAL.itemNotCappedYet("small_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
    ],
    postComplete: [],
  },
  narcadia_macros_observe_work: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Observe Marco's work",
    skill: "engineering",
    weight: 10,
    flavourText:
      "Master is at work — fixing wristwatches. Maybe you'll notice something useful?",
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Marco is finished with repairing some old watch, replacing a battery, and goes back to reading a newspaper"
      ),
    ],
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_observe_work"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Surprised by your remark, Marco says that his charger is a bit broken, but he will new one from delivery a bit later"
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.flag("marco_charger_on_hand"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_greet"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "With new battery charger set up, it seems Marco is quite happy to provide you new services"
      ),
      COMPLETION_EFFECTS.addFlag("narcadia_delivery_finished", "1"),
      COMPLETION_EFFECTS.removeFlag("narcadia_delivery_active_order"),
    ],
  },
  narcadia_marco_buy_supercharged_batteries: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Purchase supercharged battery",
    flavourText: "4 zeny per piece. Restores 2 energy",
    skill: "social",
    weight: 10,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 4),
      REVEAL.itemNotCappedYet("charged_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macro_deliver_charger"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_macros_pay_charger"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "To upgrade something, you need to understand what exactly are you upgrading, tells you Marco"
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_more_upgrades"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_lie_device")
      ),
    ],
    postComplete: [],
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
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
      CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_more_upgrades"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("narcadia_marco_explain_device")
      ),
    ],
    postComplete: [],
  },
  narcadia_workshop_leave: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave Marco's Workshop",
    skill: "exploration",
    weight: 5,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Marco's Workshop"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Western main street")],
  },
  narcadia_workshop_search: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Locate workshop",
    skill: "exploration",
    flavourText: "Maybe you can find some way to fix your device",
    weight: 15,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_2"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_seek_init"),
      CONDITION_CHECKS.ifActionCompleteRun("intro_confirm_tld"),
    ],
    postComplete: [],
  },
};
