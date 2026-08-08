import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import {
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;

export const pantheon31349MagicianLodgesActions: ActionRepository = {
  eternia31349_magician_lodges_talk_to_receptionist: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Talk to receptionist",
    flavourText: "You have no idea what you are doing here — but let's ask anyway",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
    ],
  },
  eternia31349_magician_lodges_accept_keys: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Accept keys",
    flavourText: "Apparently, H'sak took care of that. Thanks!",
    skill: "social",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_talk_to_receptionist",
      ),
    ],
  },
  eternia31349_magician_lodges_meet_residents: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Meet other residents",
    flavourText:
      "Everyone is gossiping. You're an anomaly, made from magic! They're wrong",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_accept_keys",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("eternia31349_magical_being"),
    ],
  },
  eternia31349_magician_lodges_introduce_to_taiga: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Introduce yourself to Taiga",
    flavourText: "One of the magicians is clearly interested in talking with you",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_meet_residents",
      ),
    ],
  },
  eternia31349_magician_lodges_get_acquainted_with_saop: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Get acquainted with Saop",
    flavourText: "Another magician is trying very hard not to stare at you",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_meet_residents",
      ),
    ],
  },
};
