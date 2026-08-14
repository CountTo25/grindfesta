import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  NO_CROSSGEN,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const BBASIN7281 = LOCATIONS.bbasin7281;
const BBASIN7281_SUBLOCATIONS = SUBLOCATIONS.bbasin7281;
const IN_UNRESOLVED_PRIMAL_VILLAGE_VISIT = [
  CONDITION_CHECKS.inLocation(BBASIN7281),
  CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.primalVillage),
  CONDITION_CHECKS.noFlag(
    TAGS.BBASIN7281.FIRST_VISIT_PRIMAL_VILLAGE_RESOLVED,
  ),
];

const resolvePrimalVillageFirstVisit = [
  COMPLETION_EFFECTS.addFlag(
    TAGS.BBASIN7281.FIRST_VISIT_PRIMAL_VILLAGE_RESOLVED,
    "1",
  ),
  COMPLETION_EFFECTS.reachMilestone("bbasin7281_primal_life"),
];

export const bbasin7281PrimalVillageActions: ActionRepository = {
  bbasin7281_sunless_lake_approach_primal_village: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Approach Primal Village",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.sunlessLake),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.primal_village_entrance,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        BBASIN7281_SUBLOCATIONS.primalVillage,
      ),
    ],
  },
  bbasin7281_primal_village_return_to_sunless_lake: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Sunless Lake",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(
        BBASIN7281_SUBLOCATIONS.primalVillage,
      ),
      CONDITION_CHECKS.flag(
        TAGS.BBASIN7281.FIRST_VISIT_PRIMAL_VILLAGE_RESOLVED,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(BBASIN7281_SUBLOCATIONS.sunlessLake),
    ],
  },
  bbasin7281_primal_village_defend_yourself: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Defend yourself",
    flavourText: "Residents are really NOT happy about an outsider barging in",
    skill: "survival",
    weight: 400,
    conditions: IN_UNRESOLVED_PRIMAL_VILLAGE_VISIT,
    postComplete: resolvePrimalVillageFirstVisit,
  },
  bbasin7281_primal_village_scare_them_off_with_magic: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Scare them off with magic",
    flavourText: "Time for a magic trick",
    skill: "magic",
    weight: 200,
    ...REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.fire_magic_basics),
    conditions: [
      ...IN_UNRESOLVED_PRIMAL_VILLAGE_VISIT,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
    ],
    postComplete: resolvePrimalVillageFirstVisit,
  },
  bbasin7281_primal_village_demonstrate_high_tech: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Demonstrate high tech",
    flavourText: "Would this sight calm them down?",
    skill: "engineering",
    weight: 500,
    conditions: [
      ...IN_UNRESOLVED_PRIMAL_VILLAGE_VISIT,
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.hasItem("na641_pocket_light", 1),
        (state) =>
          CONDITION_CHECKS.hasItem("na641_solar_powered_radio", 1)(state) &&
          CONDITION_CHECKS.flag(
            TAGS.NA641.RADIO.SPEAKER_AMPLIFIED,
          )(state),
      ]),
    ],
    postComplete: resolvePrimalVillageFirstVisit,
  },
  bbasin7281_primal_village_greet_residents: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Greet the residents of canyon",
    flavourText: "This storyline is to be continued in further updates",
    skill: "social",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(BBASIN7281),
      CONDITION_CHECKS.inSubLocation(BBASIN7281_SUBLOCATIONS.primalVillage),
      CONDITION_CHECKS.flag(
        TAGS.BBASIN7281.FIRST_VISIT_PRIMAL_VILLAGE_RESOLVED,
      ),
    ],
    postComplete: [],
  },
};
