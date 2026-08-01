import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
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

export const na641southernMainStreetActions: ActionRepository = {
  na641_southern_main_street_move_from_outskirts: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Move to Southern Main Street",
    skill: "exploration",
    weight: 120,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
  },
  na641_southern_main_street_return_to_outskirts: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to southern outskirts",
    skill: "exploration",
    weight: 120,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
  },
  na641_southern_main_street_check_around: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Get familiar with the area",
    skill: "perception",
    weight: 260,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.southern_main_street_library,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.southern_main_street_department_store,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.southern_main_street_upper_layer_elevator,
      ),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.upper_layer_city_hall),
      COMPLETION_EFFECTS.addLog(
        "City Hall is somewhere on the upper layer. The elevator is the obvious route, if you can get it working",
      ),
      COMPLETION_EFFECTS.addLog("There's huge department store and a library"),
    ],
  },
  na641_southern_main_street_fish_vendomat_coins: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Fish coins from under vendomats",
    skill: "perception",
    weight: 45,
    ...REVEAL.itemNotCappedYet("narcadia641_zenny"),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.hasKnowledge("narcadia_currency"),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.southern_vendomats),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_southern_main_street_check_around",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("narcadia641_zenny", 2),
      COMPLETION_EFFECTS.patchFlagNumeric(
        "na641_southern_vendomat_loot_count",
        (v) => ++v,
      ),
    ],
  },
  na641_southern_main_street_visit_library: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit library",
    skill: "exploration",
    weight: 35,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.southern_main_street_library,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
    ],
  },
  na641_library_get_card: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get library card",
    flavourText:
      "10 Zenny. List of rules & conditions is essentially a whole book",
    skill: "social",
    weight: 250,
    ...REVEAL.item("narcadia641_zenny", 10),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.LIBRARY.CARD),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 10),
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.LIBRARY.CARD, "1"),
    ],
  },
  na641_library_look_around_reading_room: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look around the reading room",
    skill: "exploration",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.library_society_of_new_arcadia,
      ),
    ],
  },
  na641_library_read_society_of_new_arcadia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read Society of New Arcadia",
    flavourText: "Learn all about the glorious state of New Arcadia!",
    skill: "social",
    weight: 6000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.library_society_of_new_arcadia,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.society_of_new_arcadia),
    ],
  },
  na641_library_go_through_shelves: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Go through the shelves",
    skill: "perception",
    weight: 1500,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.library_society_of_new_arcadia,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.library_aurexite_structural_properties,
      ),
    ],
  },
  na641_library_read_aurexite_structural_properties: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: 'Read "Structural Properties of Aurexite"',
    skill: "engineering",
    weight: 9000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.library_aurexite_structural_properties,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.aurexite_structural_properties,
      ),
    ],
  },
  na641_library_check_topmost_shelf: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check the topmost shelf",
    skill: "exploration",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.library_aurexite_structural_properties,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.library_charting_arcadia),
    ],
  },
  na641_library_read_charting_arcadia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read Charting Arcadia",
    flavourText: "Everything about how New Arcadia changed",
    skill: "exploration",
    weight: 15000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.library_charting_arcadia),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.charting_arcadia),
    ],
  },
  na641_library_find_books_about_ancient_monsters: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Find books about ancient monsters",
    skill: "perception",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.canyon_lizard_sighting,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.ancient_monster_books,
      ),
    ],
  },
  na641_library_read_about_ancient_monsters: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read about ancient monsters",
    flavourText: "pen is mightier than humongous lizard",
    skill: "survival",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_library_find_books_about_ancient_monsters",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.ancient_lizard_research,
      ),
    ],
  },
  na641_southern_main_street_leave_library: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Southern Main Street",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
  },
  na641_southern_main_street_visit_department_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit department store",
    skill: "exploration",
    weight: 35,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.southern_main_street_department_store,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStore,
      ),
    ],
  },
  na641_southern_main_street_leave_department_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Southern Main Street",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStore,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
  },
  na641_southern_main_street_visit_upper_layer_elevator: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit upper layer elevator",
    skill: "exploration",
    weight: 35,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.southern_main_street_upper_layer_elevator,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
    ],
  },
  na641_southern_main_street_leave_upper_layer_elevator: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Southern Main Street",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.CITY_HALL.CITY_HALL_QUEUE_FINISHED,
      ),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
  },
  na641_upper_layer_return_to_elevator: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Take elevator down",
    skill: "exploration",
    weight: 35,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.upperLayer),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
    ],
  },
};
