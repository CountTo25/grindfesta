import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;
const TAIGA_IN_MAINTENANCE_SECTOR = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.TAIGA_LOCATION,
  (location) => location === ETERNIA31349_SUBLOCATIONS.maintenanceSector,
);
const TAIGA_IN_HEATING_CHAMBERS = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.TAIGA_LOCATION,
  (location) =>
    location ===
    ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
);
const GUIDED_HEATING_VISIT_AVAILABLE = CONDITION_CHECKS.or([
  (state) =>
    CONDITION_CHECKS.inSubLocation(
      ETERNIA31349_SUBLOCATIONS.maintenanceSector,
    )(state) &&
    CONDITION_CHECKS.ifActionCompleteRun(
      "eternia31349_maintenance_hear_about_heart_of_arcadia",
    )(state) &&
    CONDITION_CHECKS.flag(
      TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
    )(state) &&
    TAIGA_IN_MAINTENANCE_SECTOR(state),
]);

export const pantheon31349MaintenanceSectorActions: ActionRepository = {
  eternia31349_maintenance_hear_about_heart_of_arcadia: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Hear out about heart of Eternia",
    flavourText: "Taiga is eager to show you how everything is run here",
    skill: "social",
    weight: 600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSector,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_follow_taiga_to_maintenance_sector",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
      TAIGA_IN_MAINTENANCE_SECTOR,
    ],
  },
  eternia31349_maintenance_visit_heating_chambers_with_taiga: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Visit heating chambers",
    flavourText:
      "Even in winter Eternia is comfortable and warm. Let's see what's happening there!",
    skill: "exploration",
    weight: 950,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      GUIDED_HEATING_VISIT_AVAILABLE,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.heating_chambers,
      ),
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
    ],
  },
  eternia31349_maintenance_enter_heating_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Heating Chambers",
    skill: "exploration",
    weight: 400,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSector,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.heating_chambers,
      ),
      CONDITION_CHECKS.not(GUIDED_HEATING_VISIT_AVAILABLE),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
    ],
  },
  eternia31349_maintenance_heating_chambers_take_a_look: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Take a look",
    flavourText:
      "Marvel at steam-powered machinery and talented mages at work",
    skill: "perception",
    weight: 1400,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_maintenance_visit_heating_chambers_with_taiga",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
      TAIGA_IN_HEATING_CHAMBERS,
    ],
  },
  eternia31349_maintenance_heating_chambers_practice_heating: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Practice heating stuff up!",
    flavourText: "This is not too far-fetched from manipulating energy",
    skill: "magic",
    weight: 220,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_maintenance_heating_chambers_take_a_look",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
      TAIGA_IN_HEATING_CHAMBERS,
    ],
  },
  eternia31349_maintenance_heating_chambers_wrap_up_with_taiga: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "«Looking good there»",
    flavourText: "Let's meet back at the lodges and discuss it with Saop!",
    skill: "social",
    weight: 1300,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_maintenance_heating_chambers_practice_heating",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
      TAIGA_IN_HEATING_CHAMBERS,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
    ],
  },
  eternia31349_maintenance_leave_heating_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Maintenance Sector",
    skill: "exploration",
    weight: 400,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSectorHeatingChambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.maintenanceSector,
      ),
    ],
  },
};
