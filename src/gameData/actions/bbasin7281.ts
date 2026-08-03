import { CONDITION_CHECKS, COMPLETION_EFFECTS, REVEAL } from "../../utils";
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
    flavourText: "Restores 1 energy",
    skill: "survival",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sulfurSprings),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.visited),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.flag(TAGS.NA641.RADIO.CHARGER_MODIFIED),
        CONDITION_CHECKS.ifActionCompleteRun(
          "na641_marcos_modify_solar_radio",
        ),
      ]),
      (state) => state.data.run.currentEnergy < state.data.run.maxEnergy,
      CONDITION_CHECKS.numFlagLTE(
        TAGS.BBASIN7281.SULFUR_SPRINGS_SUNNY_SPOT_CHARGES,
        3,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.restoreEnergy(1),
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
    ...NO_POSTCOMPLETE,
    title: "Fend off the lizard",
    flavourText: "Holy shit",
    skill: "survival",
    weight: 2000,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("bbasin7281_blast_lizard_noise"),
      ),
    ],
  },
  bbasin7281_blast_lizard_noise: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Blast some noise",
    flavourText:
      "That should scare it, right? Will spend 15 energy. TODO: max energy cap mods",
    skill: "engineering",
    weight: 4000,
    ...REVEAL.energy(15),
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.flag(TAGS.NA641.RADIO.SPEAKER_AMPLIFIED),
      CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun("bbasin7281_fend_off_lizard"),
      ),
    ],
    postComplete: [COMPLETION_EFFECTS.spendEnergy(15)],
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
  bbasin7281_end_of_content: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "END OF CONTENT",
    flavourText: "dev — finish the run",
    skill: "perception",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun("bbasin7281_fend_off_lizard"),
        CONDITION_CHECKS.ifActionCompleteRun("bbasin7281_blast_lizard_noise"),
      ]),
    ],
    postComplete: [COMPLETION_EFFECTS.setEnergy(-100)],
  },
  bbasin7281_sudoku: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "SUDOKU",
    flavourText: "dev — you dont have any energy and will rip in peace now",
    skill: "perception",
    weight: 10,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.canyon),
      CONDITION_CHECKS.ifActionCompleteRun("bbasin7281_end_of_content"),
    ],
  },
};
