import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
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

const ORIGINAL_BACKROOM_ENTRY_COMPLETE = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun("na641_museum_talk_staff_backrooms"),
  CONDITION_CHECKS.ifActionCompleteRun("na641_museum_bribe_staff_backrooms"),
]);

export const museumActions: ActionRepository = {
  na641_museum_search: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for NAWS History Museum",
    skill: "exploration",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.westernMainStreet),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_search"),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum)],
  },
  na641_museum_leave: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Leave for Western Main Street",
    skill: "exploration",
    stopOnRepeat: true,
    weight: 5,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.westernMainStreet)],
  },
  na641_museum_ticket_info: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Inspect ticket booth",
    skill: "perception",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("Tickets are 5 zenny each"),
      COMPLETION_EFFECTS.addKnowledge("narcadia_currency"),
    ],
  },
  na641_museum_ask_prehistoric_exposition: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Ask staff about prehistoric exposition",
    skill: "social",
    weight: 35,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.johnny_jobs),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.museum_prehistoric_exposition,
      ),
      COMPLETION_EFFECTS.addLog(
        "There was an exhibition, but its over now, with exposition pieces moved to the backrooms",
      ),
    ],
  },
  narcadia_museum_buy_ticket: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    stopOnRepeat: true,
    title: "Buy a ticket",
    skill: "social",
    weight: 10,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 5),
      REVEAL.itemNotCappedYet("naws_museum_ticket"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_ticket_info"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 5),
      COMPLETION_EFFECTS.addItem("naws_museum_ticket", 1),
      COMPLETION_EFFECTS.addLog(
        "You're now free to venture into museum. No refunds. No re-entry. No food or drink items",
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_ticket_info"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("naws_museum_ticket", 1),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumMainHall),
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumMainHall),
    ],
    postComplete: [COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum)],
  },
  na641_museum_talk_staff_backrooms: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Talk staff into letting you see backrooms",
    skill: "social",
    weight: 140,
    ...REVEAL.skillCheck("social", 18),
    conditions: [
      CONDITION_CHECKS.skillModifier("social", 6),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_ask_prehistoric_exposition",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.museum_prehistoric_exposition,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.NO_BACKROOM_ACCESS),
      CONDITION_CHECKS.not(ORIGINAL_BACKROOM_ENTRY_COMPLETE),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS, "1"),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms),
    ],
  },
  na641_museum_sneak_into_backrooms: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Sneak into backrooms",
    skill: "exploration",
    weight: 140,
    ...REVEAL.all([
      REVEAL.skillCheck("perception", 25),
      REVEAL.skillCheck("exploration", 15),
    ]),
    conditions: [
      CONDITION_CHECKS.skillModifier("perception", 10),
      CONDITION_CHECKS.skillModifier("exploration", 8),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.museum_prehistoric_exposition,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("You've found a way to sneak into backrooms!"),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms),
    ],
  },
  na641_museum_bribe_staff_backrooms: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Bribe staff into letting you see backrooms",
    skill: "social",
    weight: 35,
    ...REVEAL.item("narcadia641_zenny", 15),
    conditions: [
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_ask_prehistoric_exposition",
      ),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.museum_prehistoric_exposition,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.NO_BACKROOM_ACCESS),
      CONDITION_CHECKS.not(ORIGINAL_BACKROOM_ENTRY_COMPLETE),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 15),
      COMPLETION_EFFECTS.addLog(
        "You are let into the backrooms, but the staff is looking at you carefully",
      ),
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS, "1"),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms),
    ],
  },
  na641_museum_talk_staff_backrooms_repeat: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Talk staff into letting you see backrooms again",
    skill: "social",
    flavourText: "The staff is suspicious of your repeated interest",
    weight: 140,
    ...REVEAL.skillCheck("social", 18),
    conditions: [
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_ask_prehistoric_exposition",
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.NO_BACKROOM_ACCESS),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      ORIGINAL_BACKROOM_ENTRY_COMPLETE,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.MUSEUM.NO_BACKROOM_ACCESS, "1"),
      COMPLETION_EFFECTS.addLog("Nope, you're told to piss off"),
      COMPLETION_EFFECTS.patchFlagNumeric(TAGS.NA641.SUS_LEVEL, (v) => ++v),
    ],
  },
  na641_museum_bribe_staff_backrooms_repeat: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Bribe staff into letting you see backrooms again",
    skill: "social",
    flavourText: "The staff is suspicious of your repeated interest",
    weight: 35,
    ...REVEAL.item("narcadia641_zenny", 15),
    conditions: [
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_museum_ask_prehistoric_exposition",
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.NO_BACKROOM_ACCESS),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
      ORIGINAL_BACKROOM_ENTRY_COMPLETE,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.MUSEUM.NO_BACKROOM_ACCESS, "1"),
      COMPLETION_EFFECTS.addLog("You're promptly told to piss off"),
    ],
  },
  na641_museum_building_arcadia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Learn about how New Arcadia founding",
    skill: "engineering",
    weight: 30,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumMainHall),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "New Arcadia is a copy of city named Arcadia (sic!). Built over a desert, it provides its citizens with everything essential and relies on trading precious metals, mined from the desert",
      ),
      COMPLETION_EFFECTS.addLog(
        "Article and showcase items explain in great detail how this city was build and made sustainable. For curious youngsters, there's a mini arcade machine that lets you build your own cyber-new-arcadia",
      ),
      COMPLETION_EFFECTS.addKnowledge("narcadia_founding"),
      COMPLETION_EFFECTS.addKnowledge("narcadia_resources"),
    ],
  },
  na641_museum_history_city: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Examine 'Old Arcadia' showcase",
    skill: "perception",
    weight: 60,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumMainHall),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Quite a long time ago there was the usual Arcadia — before they unveiled large deposites of rather unique metal that allowed for cheap construction",
      ),
      COMPLETION_EFFECTS.addLog(
        "There is still quite a big reserves of it under Arcadia and they are still being mined to this day deep underground",
      ),
      COMPLETION_EFFECTS.addKnowledge("narcadia_underground_resources"),
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
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumMainHall),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_building_arcadia"),
    ],
    postComplete: [COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 1)],
  },
  narcadia_museum_blueprints: {
    ...CROSSGEN,
    ...NO_REPEAT,
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge("narcadia_west_main_street_acchikocchi"),
      COMPLETION_EFFECTS.addKnowledge("arcadia_layout"),
    ],
    title: "Examine city plan blueprints",
    skill: "engineering",
    weight: 30,
    ...REVEAL.skillCheck("perception", 2),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumMainHall),
      CONDITION_CHECKS.ifActionCompleteAny("na641_museum_building_arcadia"),
    ],
  },
};
