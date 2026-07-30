import { CONDITION_CHECKS, COMPLETION_EFFECTS } from "../../utils";
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
      CONDITION_CHECKS.hasItem("na641_modified_solar_radio", 1),
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
    ],
  },
};
