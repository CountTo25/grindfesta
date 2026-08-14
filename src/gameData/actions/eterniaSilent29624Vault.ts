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

const ETERNIA_SILENT29624 = LOCATIONS.eterniaSilent29624;
const ETERNIA_SILENT29624_SUBLOCATIONS = SUBLOCATIONS.eterniaSilent29624;

const IN_ALTERED_TIMELINE_VAULT = [
  CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
  CONDITION_CHECKS.inSubLocation(ETERNIA_SILENT29624_SUBLOCATIONS.vault),
  CONDITION_CHECKS.flag(
    TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
  ),
];

const IN_COLD_VAULT = [
  ...IN_ALTERED_TIMELINE_VAULT,
  CONDITION_CHECKS.noFlag(TAGS.ETERNIA_SILENT29624.VAULT_COLD_HANDLED),
];

const handleCold = [
  COMPLETION_EFFECTS.addFlag(
    TAGS.ETERNIA_SILENT29624.VAULT_COLD_HANDLED,
    "1",
  ),
  COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.ETERNIA_SILENT29624.visited),
];

export const eterniaSilent29624VaultActions: ActionRepository = {
  eternia_silent29624_vault_warm_yourself: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Warm yourself",
    flavourText: "It's freezing",
    skill: "magic",
    weight: 120,
    ...REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.fire_magic_basics),
    conditions: [
      ...IN_COLD_VAULT,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
    ],
    postComplete: handleCold,
  },
  eternia_silent29624_vault_start_fire: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Start a fire",
    flavourText: "Good thing you came prepared",
    skill: "survival",
    weight: 80,
    ...REVEAL.item("na641_firestarter_set", 1),
    conditions: IN_COLD_VAULT,
    postComplete: [
      COMPLETION_EFFECTS.removeItem("na641_firestarter_set", 1),
      ...handleCold,
    ],
  },
  eternia_silent29624_vault_deal_with_cold: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Deal with the cold",
    flavourText: "It's cold. You need to deal with it",
    skill: "survival",
    weight: 450,
    conditions: IN_COLD_VAULT,
    postComplete: handleCold,
  },
  eternia_silent29624_vault_survey: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Survey the silent vault",
    flavourText: "Marble and gold are still there. Lifeless",
    skill: "perception",
    weight: 1800,
    conditions: [
      ...IN_ALTERED_TIMELINE_VAULT,
      CONDITION_CHECKS.flag(TAGS.ETERNIA_SILENT29624.VAULT_COLD_HANDLED),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.ETERNIA_SILENT29624.vault_maintenance_exit,
      ),
    ],
  },
  eternia_silent29624_vault_leave_for_maintenance_sector: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave for Maintenance Sector",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      ...IN_ALTERED_TIMELINE_VAULT,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.ETERNIA_SILENT29624.vault_maintenance_exit,
      ),
      CONDITION_CHECKS.flag(TAGS.ETERNIA_SILENT29624.VAULT_COLD_HANDLED),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSector,
      ),
    ],
  },
};
