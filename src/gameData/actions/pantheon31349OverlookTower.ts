import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const OVERLOOK_TOWER = SUBLOCATIONS.eternia31349.defenseDistrictOverlookTower;

const IN_OVERLOOK_TOWER = [
  CONDITION_CHECKS.inLocation(ETERNIA31349),
  CONDITION_CHECKS.inSubLocation(OVERLOOK_TOWER),
];
const ON_TOWER_LEVEL_1 = [
  ...IN_OVERLOOK_TOWER,
  CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.TOWER_LEVEL_2),
];
const ON_TOWER_LEVEL_2 = [
  ...IN_OVERLOOK_TOWER,
  CONDITION_CHECKS.flag(TAGS.PANTHEON31349.TOWER_LEVEL_2),
  CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.TOWER_LEVEL_3),
];
const ON_TOWER_LEVEL_3 = [
  ...IN_OVERLOOK_TOWER,
  CONDITION_CHECKS.flag(TAGS.PANTHEON31349.TOWER_LEVEL_3),
];

export const pantheon31349OverlookTowerActions: ActionRepository = {
  eternia31349_overlook_tower_chat_with_posted_men: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Chat with posted men",
    flavourText: "Let's see what they see here",
    skill: "social",
    weight: 1900,
    conditions: ON_TOWER_LEVEL_1,
  },
  eternia31349_overlook_tower_monsters: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Monsters",
    flavourText: "Apparently, local fauna is quite dangerous",
    skill: "social",
    weight: 3000,
    conditions: [
      ...ON_TOWER_LEVEL_1,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_overlook_tower_chat_with_posted_men",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.fauna_danger,
      ),
    ],
  },
  eternia31349_overlook_tower_go_up_stairs: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Go up the stairs",
    flavourText: "As always, you're welcome everywhere",
    skill: "exploration",
    weight: 1400,
    conditions: [
      ...ON_TOWER_LEVEL_1,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.fauna_danger,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.TOWER_LEVEL_2, "1"),
    ],
  },
  eternia31349_overlook_tower_peek_out_window: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Peek out of the window",
    flavourText: "Endless desert is outside, no end in sight",
    skill: "perception",
    weight: 2500,
    conditions: ON_TOWER_LEVEL_2,
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.desert_outside,
      ),
    ],
  },
  eternia31349_overlook_tower_run_up_stairs: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Run up the stairs",
    flavourText: "Spice it up, some sports wouldn't hurt!",
    skill: "exploration",
    weight: 1500,
    conditions: ON_TOWER_LEVEL_2,
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.TOWER_LEVEL_3, "1"),
    ],
  },
  eternia31349_overlook_tower_check_out_floor: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check out the floor",
    flavourText: "There's a cartographer here!",
    skill: "perception",
    weight: 2700,
    conditions: ON_TOWER_LEVEL_3,
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.cartographers_floor,
      ),
    ],
  },
  eternia31349_overlook_tower_glance_at_maps: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Glance at maps",
    flavourText: "Apparently, Eternia is surrounded by a mountain ring",
    skill: "perception",
    weight: 1600,
    conditions: [
      ...ON_TOWER_LEVEL_3,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.cartographers_floor,
      ),
    ],
  },
  eternia31349_overlook_tower_interrupt_scientist: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Interrupt the scientist",
    flavourText: "He's busy working on maps. Let's chat him up!",
    skill: "social",
    weight: 1950,
    conditions: [
      ...ON_TOWER_LEVEL_3,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_overlook_tower_glance_at_maps",
      ),
    ],
  },
  eternia31349_overlook_tower_surrounding_geography: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Surrounding geography",
    flavourText: "Eternia is more akin to a crater, apparently",
    skill: "social",
    weight: 3500,
    conditions: [
      ...ON_TOWER_LEVEL_3,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_overlook_tower_interrupt_scientist",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.PANTHEON31349.crater),
      COMPLETION_EFFECTS.reachMilestone("eternia31349_from_above"),
    ],
  },
  eternia31349_overlook_tower_expeditions: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Expeditions",
    flavourText:
      "There are a lot of expeditions to chart what is beyond the crater. Maybe sign up for one?",
    skill: "social",
    weight: 2050,
    conditions: [
      ...ON_TOWER_LEVEL_3,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_overlook_tower_interrupt_scientist",
      ),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.PANTHEON31349.crater),
    ],
  },
  eternia31349_overlook_tower_apply_for_expeditions: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Apply for expeditions",
    flavourText: "You'll need to turn in this form to the Corps manager",
    skill: "social",
    weight: 2150,
    conditions: [
      ...ON_TOWER_LEVEL_3,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_overlook_tower_expeditions",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_FORM,
        "1",
      ),
    ],
  },
  eternia31349_overlook_tower_descend_to_second_floor: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Descend to second floor",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: ON_TOWER_LEVEL_3,
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.PANTHEON31349.TOWER_LEVEL_3),
    ],
  },
  eternia31349_overlook_tower_descend_to_ground_floor: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Descend to ground floor",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: ON_TOWER_LEVEL_2,
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.PANTHEON31349.TOWER_LEVEL_2),
    ],
  },
};
