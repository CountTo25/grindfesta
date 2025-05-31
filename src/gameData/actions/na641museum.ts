import type { Action } from "../../types";
import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

export const museumActions: ActionRepository = {
  na641_museum_search: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for NAWS History Museum",
    skill: "exploration",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteAny("narcadia_seek_init"),
    ],
    postComplete: [],
  },
  na641_museum_enter: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Visit NAWS History Museum",
    skill: "exploration",
    stopOnRepeat: true,
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("Western main street"),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_search"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("NAWS History Museum")],
  },
  na641_museum_leave: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Leave for Western Main Street",
    skill: "exploration",
    stopOnRepeat: true,
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("Western main street")],
  },
  na641_museum_ticket_info: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Inspect ticket booth",
    skill: "perception",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("Tickets are 5 zenny each"),
      COMPLETION_EFFECTS.addKnowledge("narcadia_currency"),
    ],
  },
  narcadia_museum_buy_ticket: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Buy a ticket",
    skill: "social",
    weight: 10,
    ...REVEAL.item("narcadia641_zenny", 5),
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum"),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_ticket_info"),
    ],
    grants: ["naws_museum_ticket"],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 5),
      COMPLETION_EFFECTS.addLog(
        "You're now free to venture into museum. No refunds. No re-entry. No food or drink items"
      ),
    ],
  },
  narcadia_museum_pass_gates: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Pass gates",
    skill: "exploration",
    stopOnRepeat: true,
    weight: 10,
    ...REVEAL.item("naws_museum_ticket", 1),
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum"),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_ticket_info"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("naws_museum_ticket", 1),
      COMPLETION_EFFECTS.moveSubLocation("NAWS History Museum — Main Hall"),
    ],
  },
  narcadia_museum_leave_main_hall: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave exposition",
    skill: "exploration",
    weight: 10,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum — Main Hall"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation("NAWS History Museum")],
  },
  na641_museum_building_arcadia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Learn about how New Arcadia founding",
    skill: "engineering",
    weight: 30,
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum — Main Hall"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "New Arcadia is a copy of city named Arcadia (sic!). Built over a desert, it provides its citizens with everything essential and relies on trading precious metals, mined from the desert"
      ),
      COMPLETION_EFFECTS.addLog(
        "Article and showcase items explain in great detail how this city was build and made sustainable. For curious youngsters, there's a mini arcade machine that lets you build your own cyber-new-arcadia"
      ),
      COMPLETION_EFFECTS.addKnowledge("narcadia_founding"),
      COMPLETION_EFFECTS.addKnowledge("narcadia_resources"),
    ],
  },
  narcadia_museum_play_building: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Play 'Build-An-Arcadia'",
    skill: "engineering",
    weight: 15,
    ...REVEAL.item("narcadia641_zenny", 1),
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum — Main Hall"),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_building_arcadia"),
    ],
    postComplete: [COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 1)],
  },
  narcadia_museum_blueprints: {
    ...CROSSGEN,
    ...NO_REPEAT,
    postComplete: [COMPLETION_EFFECTS.addKnowledge("arcadia_layout")],
    title: "Examine city plan blueprints",
    skill: "engineering",
    weight: 30,
    ...REVEAL.skillCheck("perception", 2),
    conditions: [
      CONDITION_CHECKS.inLocation("New Arcadia 641"),
      CONDITION_CHECKS.inSubLocation("NAWS History Museum — Main Hall"),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_building_arcadia"),
    ],
  },
};
