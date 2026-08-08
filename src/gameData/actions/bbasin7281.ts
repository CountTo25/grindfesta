import {
  CONDITION_CHECKS,
  COMPLETION_EFFECTS,
  REVEAL,
} from "../../utils";
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

const BBASIN7281 = LOCATIONS.bbasin7281;
const BBASIN7281_SUBLOCATIONS = SUBLOCATIONS.bbasin7281;

export const bbasin7281Actions: ActionRepository = {
  bbasin7281_intro: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look around",
    flavourText: "Wait, where am i?",
    skill: "perception",
    weight: 50,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.visited),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.BBASIN7281.visited),
      COMPLETION_EFFECTS.addLog(
        "This place looks super ancient. Lets push forward!",
      ),
    ],
  },
  bbasin7281_investigate_surroundings: {
    ...CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Investigate surroundings",
    skill: "exploration",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.visited),
    ],
  },
  bbasin7281_inspect_remains: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Inspect the remains",
    skill: "perception",
    flavourText: "This is where the fossil is from!",
    weight: 1500,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.ifActionCompleteAny(
        "bbasin7281_investigate_surroundings",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.BBASIN7281.fossil_origins),
    ],
  },
  bbasin7281_remove_weird_skull: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Remove weird skull from pool",
    flavourText: "This requires some precision",
    skill: "engineering",
    weight: 1000,
    ...REVEAL.skillCheck("engineering", 50),
    conditions: [
      CONDITION_CHECKS.skillModifier("perception", 30),
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.ifActionCompleteAny("bbasin7281_inspect_remains"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("bbasin7281_weird_skull", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("bbasin7281_weird_skull", 1),
    ],
  },
  bbasin7281_sulfur_springs_sunny_recharge: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Recharge in sunny spot",
    flavourText: "Produces 1 Small battery",
    skill: "survival",
    weight: 10,
    ...REVEAL.itemNotCappedYet("small_battery"),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.visited),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.flag(TAGS.NA641.RADIO.CHARGER_MODIFIED),
      CONDITION_CHECKS.numFlagLTE(
        TAGS.BBASIN7281.SULFUR_SPRINGS_SUNNY_SPOT_CHARGES,
        3,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("small_battery", 1),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.BBASIN7281.SULFUR_SPRINGS_SUNNY_SPOT_CHARGES,
        (v) => ++v,
      ),
    ],
  },
  bbasin7281_move_to_canyon: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Move to canyon",
    flavourText: "Lets keep on exploring the area",
    skill: "exploration",
    weight: 120,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.ifActionCompleteAny(
        "bbasin7281_investigate_surroundings",
      ),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Once you arrive to the canyon, you're confronted by huge lizard!",
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.canyon_lizard_sighting,
      ),
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
    ],
  },
  bbasin7281_fend_off_lizard: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Fend off the lizard",
    flavourText: "Holy shit",
    skill: "survival",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.BBASIN7281.canyon_lizard_weak_points,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF, "1"),
    ],
  },
  bbasin7281_fend_off_lizard_with_weakness: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Fend off the lizard",
    flavourText: "Holy shit. At least you know its weakness",
    skill: "survival",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.canyon_lizard_weak_points,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF, "1"),
    ],
  },
  bbasin7281_blast_lizard_noise: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Blast some noise",
    flavourText: "That should scare it, right? Will spend 10 energy",
    skill: "engineering",
    weight: 2000,
    ...REVEAL.energy(10),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.NA641.RADIO.SPEAKER_AMPLIFIED),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
    ],
    postComplete: [
      COMPLETION_EFFECTS.spendEnergy(10),
      COMPLETION_EFFECTS.addFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF, "1"),
    ],
  },
  bbasin7281_canyon_sunny_recharge: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Recharge in sunny spot",
    flavourText: "Produces 1 Small battery",
    skill: "survival",
    weight: 10,
    ...REVEAL.itemNotCappedYet("small_battery"),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.flag(TAGS.NA641.RADIO.CHARGER_MODIFIED),
      CONDITION_CHECKS.numFlagLTE(
        TAGS.BBASIN7281.CANYON_SUNNY_SPOT_CHARGES,
        1,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("small_battery", 1),
      COMPLETION_EFFECTS.patchFlagNumeric(
        TAGS.BBASIN7281.CANYON_SUNNY_SPOT_CHARGES,
        (v) => ++v,
      ),
    ],
  },
  bbasin7281_photograph_lizard: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Photograph the lizard",
    skill: "perception",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.hasItem("na641_fixed_camera", 1),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("bbasin7281_lizard_photo", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_fixed_camera", 1),
      COMPLETION_EFFECTS.addItem("bbasin7281_lizard_photo", 1),
    ],
  },
  bbasin7281_examine_surroundings: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Examine surroundings",
    flavourText: "This is really middle of nowhere",
    skill: "exploration",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.BBASIN7281.canyon_routing),
    ],
  },
  bbasin7281_enter_canyon_caves: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Enter Canyon Caves",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.canyon_routing),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
    ],
  },
  bbasin7281_leave_canyon_caves: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to canyon",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
    ],
  },
  bbasin7281_canyon_caves_look_around: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look around",
    flavourText: "It is really dark in here!",
    skill: "perception",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.light_source_may_be_needed,
      ),
    ],
  },
  bbasin7281_canyon_caves_light_pocket_light: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Light up pocket light",
    flavourText: "This will let you explore",
    skill: "engineering",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.hasItem("na641_pocket_light", 1),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.CANYON_CAVE_LIGHT_ON),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_pocket_light", 1),
      COMPLETION_EFFECTS.addFlag(
        TAGS.BBASIN7281.CANYON_CAVE_LIGHT_ON,
        "1",
      ),
    ],
  },
  bbasin7281_canyon_caves_cast_simple_glow: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Cast simple glow",
    flavourText: "Magic can magically solve everything!",
    skill: "magic",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.light_magic_beginner,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.noFlag(TAGS.BBASIN7281.CANYON_CAVE_LIGHT_ON),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.BBASIN7281.CANYON_CAVE_LIGHT_ON,
        "1",
      ),
    ],
  },
  bbasin7281_canyon_caves_bats: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "BATS!",
    flavourText: "Baaaats!!!",
    skill: "survival",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.CANYON_CAVE_LIGHT_ON),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone(
        "bbasin7281_canyon_caves_lights_on",
      ),
    ],
  },
  bbasin7281_canyon_caves_examine_structure: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Examine the structure of this cave",
    flavourText: "Some parts really feel constructed, rather than natural",
    skill: "engineering",
    weight: 1400,
    ...REVEAL.skillCheck("engineering", 50),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.ifActionCompleteRun(
        "bbasin7281_canyon_caves_bats",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.BBASIN7281.cave_man_made),
    ],
  },
  bbasin7281_canyon_caves_examine_bats: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Take a look at the bats",
    flavourText: "Those are weird — their eyes are literally still glowing",
    skill: "perception",
    weight: 1700,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.ifActionCompleteRun(
        "bbasin7281_canyon_caves_bats",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.prehistoric_mutations,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.BBASIN7281.bats_eyes_glow),
    ],
  },
  bbasin7281_canyon_caves_look_around_lit_cave: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Look around the lit-up cave",
    flavourText: "Now, is there anything interesting?",
    skill: "exploration",
    weight: 1500,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.ifActionCompleteRun(
        "bbasin7281_canyon_caves_bats",
      ),
    ],
  },
  bbasin7281_canyon_caves_try_read_inscriptions: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Try to read inscriptions",
    flavourText:
      "Something is scribbled on the walls — but it is hard to make it out",
    skill: "perception",
    weight: 1700,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.ifActionCompleteRun(
        "bbasin7281_canyon_caves_look_around_lit_cave",
      ),
    ],
  },
  bbasin7281_canyon_caves_read_message_in_eternian: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Read message in Eternian",
    flavourText: "«War District Warehouse», maybe?",
    skill: "perception",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.ifActionCompleteRun(
        "bbasin7281_canyon_caves_try_read_inscriptions",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_symbolics,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.canyon_cave_war_district_warehouse,
      ),
    ],
  },
  bbasin7281_canyon_caves_try_make_sense_of_inscriptions: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Try to make sense of it",
    flavourText: "Really reads like gibberish, better move on",
    skill: "perception",
    weight: 700,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyonCaves),
      CONDITION_CHECKS.ifActionCompleteRun(
        "bbasin7281_canyon_caves_try_read_inscriptions",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.basic_symbolics,
        ),
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.BBASIN7281.canyon_cave_war_district_warehouse,
        ),
      ),
    ],
  },
  bbasin7281_leave_sunless_lake: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to canyon",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sunlessLake),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
    ],
  },
  bbasin7281_examine_deposits: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Examine deposits",
    flavourText: "There is a lot of Aurexite",
    skill: "perception",
    weight: 1500,
    ...REVEAL.skillCheck("perception", 50),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.aurexite_structural_properties,
      ),
      CONDITION_CHECKS.skillModifier("perception", 5),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.BBASIN7281.aurexite_deposits,
      ),
    ],
  },
  bbasin7281_mine_surface_aurexite: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Mine surface Aurexite",
    flavourText: "Its quality is low — but still precious",
    skill: "engineering",
    weight: 900,
    ...REVEAL.itemNotCappedYet("bbasin7281_rough_aurexite_chunk"),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.aurexite_deposits,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addItem("bbasin7281_rough_aurexite_chunk", 1),
    ],
  },
  bbasin7281_leave_canyon: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Sulfur Springs",
    skill: "exploration",
    idx: 10,
    weight: 120,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
    ],
  },
  bbasin7281_return_to_canyon: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to canyon",
    skill: "exploration",
    weight: 120,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.flag(TAGS.BBASIN7281.LIZARD_SCARED_OFF),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
    ],
  },
};
