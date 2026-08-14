import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
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

const IN_MAINTENANCE_SECTOR = [
  CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
  CONDITION_CHECKS.inSubLocation(
    ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSector,
  ),
];

export const eterniaSilent29624MaintenanceSectorActions: ActionRepository = {
  eternia_silent29624_maintenance_sector_assess_emptiness: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Assess the emptiness",
    flavourText: "There's no one. No humming of magical machinery, either",
    skill: "perception",
    weight: 3400,
    conditions: IN_MAINTENANCE_SECTOR,
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.ETERNIA_SILENT29624.heating_chambers,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.ETERNIA_SILENT29624.scholars_district,
      ),
    ],
  },
  eternia_silent29624_maintenance_sector_return_to_vault: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Vault",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      ...IN_MAINTENANCE_SECTOR,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.vault,
      ),
    ],
  },
  eternia_silent29624_maintenance_sector_visit_heating_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Heating Chambers",
    skill: "exploration",
    weight: 400,
    stopOnRepeat: true,
    conditions: [
      ...IN_MAINTENANCE_SECTOR,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.ETERNIA_SILENT29624.heating_chambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
    ],
  },
  eternia_silent29624_heating_chambers_return_to_maintenance_sector: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Maintenance Sector",
    skill: "exploration",
    weight: 400,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSector,
      ),
    ],
  },
};
