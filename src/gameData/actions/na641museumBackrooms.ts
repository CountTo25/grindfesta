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
const BACKROOMS_OR_PALEONTOLOGY_STORAGE = CONDITION_CHECKS.or([
  CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms),
  CONDITION_CHECKS.inSubLocation(
    NA641_SUBLOCATIONS.nawsHistoryMuseumPaleontologyExhibitStorage,
  ),
]);

export const museumBackroomsActions: ActionRepository = {
  na641_museum_backrooms_follow_staff: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Follow staff",
    skill: "exploration",
    flavourText: "Lets follow along nicely",
    weight: 60,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.museum_paleontology_specimens_location,
      ),
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumPaleontologyExhibitStorage,
      ),
    ],
  },
  na641_museum_backrooms_jam_display_sensor: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Jam display sensor",
    skill: "engineering",
    flavourText: "Overload the sensor to win some time",
    weight: 120,
    ...REVEAL.all([
      REVEAL.skillCheck("engineering", 6),
      REVEAL.skillCheck("perception", 20),
      REVEAL.item("small_battery", 2),
    ]),
    conditions: [
      CONDITION_CHECKS.skillModifier("engineering", 1.5),
      CONDITION_CHECKS.skillModifier("perception", 10),
      CONDITION_CHECKS.inLocation(NA641),
      BACKROOMS_OR_PALEONTOLOGY_STORAGE,
      CONDITION_CHECKS.flag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("small_battery", 2),
      COMPLETION_EFFECTS.patchFlagNumeric(TAGS.NA641.SUS_LEVEL, (i) => ++i),
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
      COMPLETION_EFFECTS.addLog(
        "Staff is confused and goes away to get some help. You now have some time to look around",
      ),
    ],
  },
  na641_museum_backrooms_lose_staff_aisles: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Lose staff between storage aisles",
    skill: "exploration",
    weight: 180,
    ...REVEAL.skillCheck("exploration", 25),
    conditions: [
      CONDITION_CHECKS.skillModifier("exploration", 10),
      CONDITION_CHECKS.inLocation(NA641),
      BACKROOMS_OR_PALEONTOLOGY_STORAGE,
      CONDITION_CHECKS.flag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
      COMPLETION_EFFECTS.addLog(
        "You managed to shake off the staff. Now you're free to explore",
      ),
    ],
  },
  na641_museum_backrooms_find_paleontology_specimens: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look for paleontology specimens",
    skill: "perception",
    flavourText: "Now where are they?",
    weight: 360,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.NA641.museum_paleontology_specimens_location,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.museum_paleontology_specimens_location,
      ),
      COMPLETION_EFFECTS.addLog("Found them! Wont take too long next time"),
    ],
  },
  na641_museum_backrooms_go_to_paleontology_storage: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Go to paleontology exhibit storage",
    skill: "exploration",
    weight: 65,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.museum_paleontology_specimens_location,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumPaleontologyExhibitStorage,
      ),
    ],
  },
  na641_museum_backrooms_go_to_maintenance_room: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Sneak into maintenance room",
    skill: "exploration",
    weight: 65,
    stopOnRepeat: true,
    ...REVEAL.skillCheck("perception", 60),
    conditions: [
      CONDITION_CHECKS.skillModifier("perception", 15),
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumMaintenanceRoom,
      ),
    ],
  },
  na641_museum_paleontology_storage_steal_fossil: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Steal ancient fossil",
    skill: "exploration",
    weight: 90,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumPaleontologyExhibitStorage,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("anchor_ancient_bone", 1),
      COMPLETION_EFFECTS.addLog("Time leap device reacts to the fossil"),
      COMPLETION_EFFECTS.addLog(
        "You took the fossil. Apparently it can serve as anchor for your time leap device",
      ),
    ],
  },
  na641_museum_leave_backrooms: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave backrooms",
    skill: "exploration",
    weight: 10,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.NA641.MUSEUM.STAFF_FOLLOWS),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.nawsHistoryMuseum),
    ],
  },
  na641_museum_paleontology_storage_return_backrooms: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to backrooms",
    skill: "exploration",
    weight: 10,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumPaleontologyExhibitStorage,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
    ],
  },
  na641_museum_maintenance_room_return_backrooms: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to backrooms",
    skill: "exploration",
    weight: 10,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumMaintenanceRoom,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.nawsHistoryMuseumBackrooms,
      ),
    ],
  },
};
