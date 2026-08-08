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

export const na641CityHallActions: ActionRepository = {
  na641_city_hall_check_interior: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check interior",
    flavourText: "Get familiar with heart of Arcadia",
    skill: "perception",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
    ],
    postComplete: [],
  },
  na641_city_hall_observe_others: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Observe others",
    flavourText: "What is happening here?",
    skill: "perception",
    weight: 375,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_city_hall_check_interior",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "There are two elevators. One reaches the top level; the other goes to City Hall. The line for City Hall is noticeably longer. Almost no one goes to the top.",
      ),
    ],
  },
  na641_city_hall_queue_top_layer: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Get in line for top layer",
    skill: "exploration",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_city_hall_observe_others",
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.NA641.CITY_HALL.CITY_HALL_QUEUE_FINISHED,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_city_hall_get_escorted_out",
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
        "1",
      ),
      COMPLETION_EFFECTS.addLog(
        "Some staff member is suddenly approaching!",
      ),
    ],
  },
  na641_city_hall_get_escorted_out: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Get escorted out",
    flavourText: "Apparently they dont let just anyone in",
    skill: "social",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
      CONDITION_CHECKS.flag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.southernMainStreet),
    ],
  },
  na641_city_hall_present_top_level_pass: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Present a pass",
    flavourText: "That did come in handy!",
    skill: "social",
    weight: 1300,
    ...REVEAL.item("na641_top_level_pass", 1),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
      CONDITION_CHECKS.flag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_city_hall_get_escorted_out",
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.upperLayer),
    ],
  },
  na641_city_hall_queue_city_hall: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Queue for City Hall",
    skill: "exploration",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_city_hall_observe_others",
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.NA641.CITY_HALL.CITY_HALL_QUEUE_FINISHED,
      ),
      CONDITION_CHECKS.noFlag(
        TAGS.NA641.CITY_HALL.TOP_LEVEL_QUEUE_FINISHED,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.CITY_HALL.CITY_HALL_QUEUE_FINISHED,
        "1",
      ),
    ],
  },
  na641_city_hall_go_to_city_hall: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Go to City Hall",
    skill: "exploration",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
      CONDITION_CHECKS.flag(
        TAGS.NA641.CITY_HALL.CITY_HALL_QUEUE_FINISHED,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.CITY_HALL.CITY_HALL_QUEUE_FINISHED,
      ),
      COMPLETION_EFFECTS.moveSubLocation(NA641_SUBLOCATIONS.cityHall),
    ],
  },
  na641_city_hall_witness_heights: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Witness New Arcadia heights",
    flavourText:
      "You can see the whole city — and the sky — from City Hall entrance",
    skill: "perception",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Quite a lot of reception windows at the entrance",
      ),
    ],
  },
  na641_city_hall_greet_reception_staff: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Greet reception staff",
    skill: "social",
    weight: 500,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_city_hall_witness_heights",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog("You are asked to present your ID"),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.city_hall_requires_identification,
      ),
    ],
  },
  na641_city_hall_excuse_and_retreat: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Make up an excuse and retreat",
    skill: "social",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_city_hall_greet_reception_staff",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.or([
          CONDITION_CHECKS.hasItem("new_arcadia_fake_id", 1),
          CONDITION_CHECKS.hasItem("new_arcadia_id", 1),
        ]),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
    ],
  },
  na641_city_hall_present_id: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Present the ID",
    skill: "social",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_city_hall_greet_reception_staff",
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.hasItem("new_arcadia_fake_id", 1),
        CONDITION_CHECKS.hasItem("new_arcadia_id", 1),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.CITY_HALL.SOCIAL_STANDING_CHANGED,
        "1",
      ),
    ],
  },
  na641_city_hall_check_social_standing: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Check social standing",
    flavourText: "Let's see how high you are in New Arcadia",
    skill: "social",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
      CONDITION_CHECKS.ifActionCompleteRun("na641_city_hall_present_id"),
      CONDITION_CHECKS.flag(
        TAGS.NA641.CITY_HALL.SOCIAL_STANDING_CHANGED,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.NA641.CITY_HALL.SOCIAL_STANDING_CHANGED,
      ),
    ],
  },
  na641_city_hall_apply_lower_arcadia_visit: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Apply for a lower Arcadia visit",
    flavourText: "Let's see what it takes to reach Lower Arcadia",
    skill: "social",
    weight: 800,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
      CONDITION_CHECKS.ifActionCompleteRun("na641_city_hall_present_id"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteGlobal(
          "na641_city_hall_apply_lower_arcadia_visit",
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Your application is accepted for review. Reaching Lower Arcadia will require further clearance.",
      ),
    ],
  },
  na641_city_hall_await_lower_arcadia_clearance: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "«Await further clearance»",
    flavourText:
      "Your application disappears into City Hall's machinery. This route continues in a future update.",
    skill: "social",
    weight: 1,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
      CONDITION_CHECKS.ifActionCompleteRun("na641_city_hall_present_id"),
      CONDITION_CHECKS.ifActionCompleteGlobal(
        "na641_city_hall_apply_lower_arcadia_visit",
      ),
    ],
    postComplete: [],
  },
  na641_city_hall_return_to_elevators: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to elevators",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(NA641_SUBLOCATIONS.cityHall),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetUpperLayerElevator,
      ),
    ],
  },
};
