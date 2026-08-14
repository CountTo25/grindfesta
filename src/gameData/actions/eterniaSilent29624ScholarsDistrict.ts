import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA_SILENT29624 = LOCATIONS.eterniaSilent29624;
const ETERNIA_SILENT29624_SUBLOCATIONS = SUBLOCATIONS.eterniaSilent29624;

const IN_SCHOLARS_DISTRICT_COLD = [
  CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
  CONDITION_CHECKS.inSubLocation(
    ETERNIA_SILENT29624_SUBLOCATIONS.scholarsDistrict,
  ),
  CONDITION_CHECKS.noFlag(
    TAGS.ETERNIA_SILENT29624.SCHOLARS_DISTRICT_COLD_HANDLED,
  ),
];

const handleScholarsDistrictCold = COMPLETION_EFFECTS.addFlag(
  TAGS.ETERNIA_SILENT29624.SCHOLARS_DISTRICT_COLD_HANDLED,
  "1",
);

const coldRemainsMilestone = COMPLETION_EFFECTS.reachMilestone(
  "eternia_silent29624_cold_remains",
);

export const eterniaSilent29624ScholarsDistrictActions: ActionRepository = {
  eternia_silent29624_maintenance_sector_travel_to_scholars_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Travel to Scholar's District",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSector,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.ETERNIA_SILENT29624.scholars_district,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia_silent29624_scholars_district_fend_off_cold: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Fend off the cold",
    flavourText: "The blizzard is too violent. You need to fend it off",
    skill: "magic",
    weight: 600,
    ...REVEAL.all([
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.fire_magic_basics),
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
    ]),
    conditions: IN_SCHOLARS_DISTRICT_COLD,
    postComplete: [handleScholarsDistrictCold, coldRemainsMilestone],
  },
  eternia_silent29624_scholars_district_steel_yourself: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Steel yourself",
    flavourText:
      "The snowstorm is almost unbearable. You need to fight through it",
    skill: "survival",
    weight: 800,
    conditions: IN_SCHOLARS_DISTRICT_COLD,
    postComplete: [handleScholarsDistrictCold, coldRemainsMilestone],
  },
  eternia_silent29624_scholars_district_return_to_maintenance_sector: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Maintenance Sector",
    skill: "exploration",
    weight: 600,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.maintenanceSector,
      ),
    ],
  },
  eternia_silent29624_scholars_district_visit_divining_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Divining Chambers",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.flag(
        TAGS.ETERNIA_SILENT29624.SCHOLARS_DISTRICT_COLD_HANDLED,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.divining_chambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.diviningChambers,
      ),
    ],
  },
  eternia_silent29624_divining_chambers_return_to_scholars_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.diviningChambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia_silent29624_divining_chambers_check_out_monolith: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Check out the monolith",
    flavourText: "No lights, only an ice-covered cold surface",
    skill: "perception",
    weight: 3000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.diviningChambers,
      ),
    ],
  },
  eternia_silent29624_divining_chambers_gaze_onto_mirror_surface: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Gaze onto mirror surface",
    flavourText: "There is nothing there (to be continued in future updates)",
    skill: "perception",
    weight: 3100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA_SILENT29624),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA_SILENT29624_SUBLOCATIONS.diviningChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia_silent29624_divining_chambers_check_out_monolith",
      ),
    ],
  },
};
