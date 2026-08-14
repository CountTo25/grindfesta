import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { DELIVERY_TAGS, KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;
const FOSSIL_JOB_COMPLETE = CONDITION_CHECKS.or([
  CONDITION_CHECKS.ifActionCompleteRun(
    "na641_johnny_turn_in_procured_goods",
  ),
  CONDITION_CHECKS.ifActionCompleteRun("na641_johnny_turn_in_weird_skull"),
]);

export const na641southernMainStreetActions: ActionRepository = {
  na641_southern_main_street_move_from_outskirts: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Move to Southern Main Street",
    skill: "exploration",
    weight: 90,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetOutskirts,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      COMPLETION_EFFECTS.reachMilestone(
        "na641_enter_southern_main_street",
      ),
    ],
  },
  na641_southern_main_street_return_to_outskirts: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to southern outskirts",
    skill: "exploration",
    weight: 90,
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
  na641_johnny_gather_information: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Gather information",
    flavourText: "Lets provide Johnny's gang with some info",
    skill: "perception",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      FOSSIL_JOB_COMPLETE,
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.numFlagGTE(
          TAGS.NA641.JOHNNY.INFORMATION_AMASSED,
          3,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.NA641.JOHNNY.INFORMATION_AMASSED,
        (information) => information + 1,
      ),
    ],
  },
  na641_johnny_compile_information_report: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Compile report",
    flavourText: "Bring it back to Johnny after you're done",
    skill: "social",
    weight: 250,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.numFlagGTE(
        TAGS.NA641.JOHNNY.INFORMATION_AMASSED,
        3,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("na641_johnny_information_report", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("na641_johnny_information_report", 1),
    ],
  },
  na641_delivery_look_for_package_recipient: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Look for package recipient",
    flavourText: "It was in some small store...",
    skill: "perception",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.hasItem("na641_compromised_package", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.southern_main_street_leatherworks,
      ),
    ],
  },
  na641_southern_main_street_visit_leatherworks: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Leatherworks",
    skill: "exploration",
    weight: 35,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.southern_main_street_leatherworks,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLeatherworks,
      ),
    ],
  },
  na641_southern_main_street_leave_leatherworks: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Southern Main Street",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLeatherworks,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
  },
  na641_leatherworks_look_at_wares: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look at wares",
    flavourText: "Quite a selection of handcrafted goods. Mostly wallets",
    skill: "perception",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLeatherworks,
      ),
    ],
    postComplete: [],
  },
  na641_leatherworks_buy_handcrafted_wallet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy handcrafted wallet",
    flavourText: "20 Zenny",
    skill: "social",
    weight: 400,
    ...REVEAL.item("narcadia641_zenny", 20),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLeatherworks,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_leatherworks_look_at_wares",
      ),
      CONDITION_CHECKS.noFlag(TAGS.MODIFIERS.HAS_HANDCRAFTED_WALLET),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 20),
      COMPLETION_EFFECTS.addFlag(
        TAGS.MODIFIERS.HAS_HANDCRAFTED_WALLET,
        "true",
      ),
    ],
  },
  na641_leatherworks_deliver_special_package: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Deliver the special package",
    flavourText: "Surely nothing bad will happen",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLeatherworks,
      ),
      CONDITION_CHECKS.hasItem("na641_compromised_package", 1),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_compromised_package", 1),
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.LEATHERWORKS.COMPROMISED,
        "1",
      ),
      COMPLETION_EFFECTS.removeFlag(DELIVERY_TAGS.johnny_setup_delivery),
      COMPLETION_EFFECTS.removeFlag(DELIVERY_TAGS.active_order),
      COMPLETION_EFFECTS.addFlag("narcadia_delivery_finished", "1"),
      COMPLETION_EFFECTS.addLog("Report your delivery to local Rapid office"),
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
    weight: 110,
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
    weight: 560,
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
    weight: 160,
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
    weight: 690,
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
    weight: 220,
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
    weight: 520,
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
  na641_library_conduct_search_for_eternia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Conduct search in library",
    flavourText: "Chances are slim, but let's see",
    skill: "perception",
    weight: 3000,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
    ],
  },
  na641_library_consult_staff_about_eternia: {
    ...CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Consult with staff",
    flavourText:
      "Apparently, if you want to talk about ancient books, you'll need to talk to the Library Master",
    skill: "social",
    weight: 1500,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_library_conduct_search_for_eternia",
      ),
    ],
  },
  na641_library_find_books_about_ancient_monsters: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Find books about ancient monsters",
    skill: "perception",
    weight: 100,
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
    weight: 100,
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
  na641_library_check_monster_authors_note: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check out author's note on monsters",
    flavourText: "That might come in helpful",
    skill: "perception",
    weight: 500,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_library_read_about_ancient_monsters",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.professor_naoto_lead),
      COMPLETION_EFFECTS.addLog(
        "Luckily, he lives nearby — let's see if you can find Professor Naoto on Western Main Street",
      ),
    ],
  },
  na641_library_ask_about_further_reading: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about further reading",
    flavourText: "You've read everything that piqued your interest",
    skill: "social",
    weight: 720,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.ifActionCompleteAny([
        "na641_library_read_society_of_new_arcadia",
        "na641_library_read_aurexite_structural_properties",
        "na641_library_read_charting_arcadia",
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.library_master_librarian,
      ),
    ],
  },
  na641_library_find_directors_office: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Find director's office",
    flavourText: "Lets see if there's anything interesting",
    skill: "exploration",
    weight: 480,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetLibrary,
      ),
      CONDITION_CHECKS.flag(TAGS.NA641.LIBRARY.CARD),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.library_master_librarian,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.library_master_librarian_chambers,
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
