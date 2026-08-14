import {
  COMPLETION_EFFECTS,
  CONDITION_CHECKS,
  REVEAL,
} from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const MAGICAL_CORPS_HQ =
  SUBLOCATIONS.eternia31349.defenseDistrictMagicalCorpsHq;

const IN_MAGICAL_CORPS_HQ = [
  CONDITION_CHECKS.inLocation(ETERNIA31349),
  CONDITION_CHECKS.inSubLocation(MAGICAL_CORPS_HQ),
];

export const pantheon31349MagicalCorpsActions: ActionRepository = {
  eternia31349_magical_corps_greet_servicemen: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Greet the servicemen",
    flavourText: "Majestic white robes don't scream military to you",
    skill: "social",
    weight: 1800,
    conditions: IN_MAGICAL_CORPS_HQ,
  },
  eternia31349_magical_corps_turn_in_documents: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Turn in documents",
    flavourText:
      "Seems like it is not super important, but desk staff is happy to get it nevertheless (To be continued in future updates)",
    skill: "exploration",
    weight: 1500,
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magical_corps_greet_servicemen",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.HAS_DOCUMENT_DELIVERY_CONTROL,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.HAS_DOCUMENT_DELIVERY_CONTROL,
      ),
    ],
  },
  eternia31349_magical_corps_turn_in_application: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Turn in application",
    flavourText: "Let's go on an expedition!",
    skill: "social",
    weight: 2100,
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magical_corps_greet_servicemen",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_FORM,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_FORM,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_SUBMITTED,
        "1",
      ),
    ],
  },
  eternia31349_magical_corps_demonstrate_fire_magic: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Demonstrate fire magic",
    flavourText: "Eternal classic. Just blow everything up!",
    skill: "magic",
    weight: 400,
    ...REVEAL.all([
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.fire_magic_basics),
    ]),
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_SUBMITTED,
      ),
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES,
        "1",
      ),
    ],
  },
  eternia31349_magical_corps_summon_sparks: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Summon sparks",
    flavourText: "Energy transfer can be used offensively!",
    skill: "magic",
    weight: 400,
    ...REVEAL.all([
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.energy_manipulation),
    ]),
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_SUBMITTED,
      ),
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES,
        "1",
      ),
    ],
  },
  eternia31349_magical_corps_demonstrate_extreme_agility: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Demonstrate extreme agility",
    flavourText: "All the running around pays off!",
    skill: "exploration",
    weight: 3000,
    ...REVEAL.skillCheck("exploration", 2500),
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_SUBMITTED,
      ),
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES,
        "1",
      ),
    ],
  },
  eternia31349_magical_corps_demonstrate_survival_skills: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Demonstrate survival skills",
    flavourText: "You've already seen all those lizards",
    skill: "survival",
    weight: 3000,
    ...REVEAL.all([
      REVEAL.skillCheck("survival", 300),
      REVEAL.hasKnowledge(KNOWLEDGE.BBASIN7281.scaring_off_lizard),
    ]),
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.EXPEDITION_APPLICATION_SUBMITTED,
      ),
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES),
      CONDITION_CHECKS.skillModifier("survival", 1.01),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES,
        "1",
      ),
    ],
  },
  eternia31349_magical_corps_sign_up_for_service: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Sign up for service",
    flavourText: "Let's join the ranks!",
    skill: "social",
    weight: 2700,
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.SHOWED_CORPS_ABILITIES),
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.CORPS_MEMBER),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.CORPS_MEMBER, "1"),
      COMPLETION_EFFECTS.reachMilestone("eternia31349_corpsman"),
    ],
  },
  eternia31349_magical_corps_sign_up_for_next_expedition: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Sign up for next expedition",
    flavourText: "To be continued in future updates",
    skill: "social",
    weight: 2600,
    conditions: [
      ...IN_MAGICAL_CORPS_HQ,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.CORPS_MEMBER),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.READY_FOR_EXPEDITION,
        "1",
      ),
    ],
  },
};
