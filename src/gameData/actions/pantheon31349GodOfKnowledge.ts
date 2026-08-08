import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const DIVINING_CHAMBERS = SUBLOCATIONS.eternia31349.diviningChambers;

export const pantheon31349GodOfKnowledgeActions: ActionRepository = {
  eternia31349_divining_chambers_ask_acolytes_about_monolith: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask acolytes about monolith",
    flavourText: "Lets see what this god talk is all about",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_meet_devouts",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.communicating_with_gods,
      ),
    ],
  },
  eternia31349_divining_chambers_ask_god_about_eternia: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Ask God of Knowledge about Eternia",
    flavourText: "As suggested by acolytes, ask a question and wait for a bit",
    skill: "magic",
    weight: 20,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.communicating_with_gods,
      ),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_receive_further_guidance",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_talk_to_casm_overachieved",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_talk_to_casm_shocked",
        ),
      ]),
    ],
  },
  eternia31349_divining_chambers_clarify_gods_intent: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Clarify intent",
    flavourText: "Apparently, god is confused by your existence",
    skill: "magic",
    weight: 30,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_ask_god_about_eternia",
      ),
    ],
  },
  eternia31349_divining_chambers_tell_god_about_time_travel: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Tell the God about time travel",
    flavourText: "If it is a god, it'll figure it out anyways",
    skill: "magic",
    weight: 50,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_clarify_gods_intent",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_admit_created_by_hsak",
        ),
      ),
    ],
  },
  eternia31349_divining_chambers_admit_created_by_hsak: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Admit to being created by H'Sak",
    flavourText: "He did bring you here in a way, after all",
    skill: "social",
    weight: 950,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_clarify_gods_intent",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_tell_god_about_time_travel",
        ),
      ),
    ],
  },
  eternia31349_divining_chambers_dig_deep_into_magic: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Dig deep into magic",
    flavourText: "«This cannot be possible»",
    skill: "magic",
    weight: 55,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_admit_created_by_hsak",
      ),
    ],
  },
  eternia31349_divining_chambers_time_paradox: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "The time paradox",
    flavourText:
      "«As long as humanity exists, i exist. Yet you dont know about your gods?»",
    skill: "social",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_tell_god_about_time_travel",
      ),
    ],
  },
  eternia31349_divining_chambers_walk_away: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Walk away",
    flavourText:
      "God fell silent for now. Maybe you should return later? (To be expanded in future updates)",
    skill: "exploration",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_dig_deep_into_magic",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_time_paradox",
        ),
      ]),
    ],
  },
};
