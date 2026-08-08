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

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;
const HSAK_INTRO_FINISHED = CONDITION_CHECKS.ifActionCompleteRun(
  "pantheon31349_part_ways_with_hsak",
);

export const pantheon31349ScholarsDistrictActions: ActionRepository = {
  pantheon31349_listen_closely: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Listen closely",
    flavourText:
      "«Magic is mysterious. Seems I've summoned you into this world — now I shall let you run amok in it»",
    skill: "social",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.HSAK_FOLLOWS),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.PANTHEON31349.magic),
    ],
  },
  pantheon31349_part_ways_with_hsak: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Part ways",
    flavourText:
      "«Shall you ever need me — I'll be in the Library to guide you»",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.HSAK_FOLLOWS),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_listen_closely"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(TAGS.PANTHEON31349.HSAK_FOLLOWS),
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.HSAK_IN_LIBRARY, "1"),
    ],
  },
  pantheon31349_look_around_scholars_district: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look around",
    flavourText:
      "Aside from marveling at marble and gold, let's find something interesting",
    skill: "perception",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.divining_chambers,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.ewais_everyday_goods,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.magician_lodges,
      ),
    ],
  },
  pantheon31349_visit_divining_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Divining Chambers",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.divining_chambers,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
    ],
  },
  pantheon31349_leave_divining_chambers: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.diviningChambers,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  pantheon31349_visit_ewais_everyday_goods: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Ewai's Everyday Goods",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.ewais_everyday_goods,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.ewaisEverydayGoods,
      ),
    ],
  },
  pantheon31349_leave_ewais_everyday_goods: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.ewaisEverydayGoods,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  pantheon31349_visit_magician_lodges: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit Magician Lodges",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.magician_lodges,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
    ],
  },
  pantheon31349_leave_magician_lodges: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia31349_locate_bank_branch: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Locate bank branch",
    flavourText: "A rather mundane institution for a magical world",
    skill: "perception",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.PANTHEON31349.currency),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.bank_branch,
      ),
    ],
  },
  eternia31349_visit_bank_branch: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit bank",
    skill: "exploration",
    weight: 1500,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.bank_branch,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.bankBranch,
      ),
    ],
  },
  eternia31349_leave_bank_branch: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Scholar's District",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.bankBranch,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia31349_inspect_noticeboard: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Inspect the noticeboard",
    flavourText: "Now that you know how money works, let's find some job",
    skill: "perception",
    weight: 1300,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.currency_operation,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.scholar_district_jobs,
      ),
    ],
  },
  eternia31349_pick_diviners_offer: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Pick an offer from Diviners",
    flavourText: "Cleaning up should be rather easy?",
    skill: "exploration",
    weight: 500,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.scholar_district_jobs,
      ),
      HSAK_INTRO_FINISHED,
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.GOT_JOB_OFFER_CLEANING_DIVINERS,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.GOT_JOB_OFFER_CLEANING_DIVINERS,
        "1",
      ),
    ],
  },
  eternia31349_pick_library_sorting_offer: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Book sorting",
    flavourText: "Library is massive — and they need some help",
    skill: "perception",
    weight: 500,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.scholar_district_jobs,
      ),
      HSAK_INTRO_FINISHED,
      CONDITION_CHECKS.noFlag(
        TAGS.PANTHEON31349.GOT_JOB_OFFER_SORTING_LIBRARY,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.GOT_JOB_OFFER_SORTING_LIBRARY,
        "1",
      ),
    ],
  },
  pantheon31349_enter_library: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Library",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
      HSAK_INTRO_FINISHED,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
    ],
  },
  pantheon31349_return_to_scholars_district: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Leave to Scholar's District",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.greatLibrary,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("pantheon31349_leave_with_hsak"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
};
