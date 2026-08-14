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
const STANDARD_GODS_UNITED_ROUTE = CONDITION_CHECKS.or([
  (state) =>
    CONDITION_CHECKS.ifActionCompleteRun(
      "eternia31349_divining_chambers_ask_about_this_era",
    )(state) &&
    CONDITION_CHECKS.ifActionCompleteRun(
      "eternia31349_divining_chambers_time_paradox",
    )(state),
  (state) =>
    CONDITION_CHECKS.ifActionCompleteRun(
      "eternia31349_divining_chambers_ask_about_this_era",
    )(state) &&
    CONDITION_CHECKS.ifActionCompleteRun(
      "eternia31349_divining_chambers_creation_magic",
    )(state),
]);

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
  eternia31349_divining_chambers_discuss_tales_of_eternia: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Discuss the book",
    flavourText: "«So, in a thousand years, we will disappear?»",
    skill: "social",
    weight: 1800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_ask_god_about_eternia",
      ),
      CONDITION_CHECKS.hasItem("anchor_god_of_knowledge_book", 1),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.gods_persisted_memories,
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
  eternia31349_divining_chambers_creation_magic: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Creation magic",
    flavourText:
      "«Manipulate, control, alter matter — yes. But creating a human is a whole other thing. Impossible. Curious»",
    skill: "magic",
    weight: 60,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_dig_deep_into_magic",
      ),
    ],
  },
  eternia31349_divining_chambers_time_paradox: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "The time paradox",
    flavourText:
      "«If you truly are a time traveler, how could you not foresee this?»",
    skill: "social",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_tell_god_about_time_travel",
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_foresee_time_travel_test",
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.god_time_travel_test,
      ),
    ],
  },
  eternia31349_divining_chambers_foresee_time_travel_test: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "If I truly am a time traveler, I could foresee this",
    flavourText: "«I see. It is true, then»",
    skill: "social",
    weight: 1600,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_tell_god_about_time_travel",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.god_time_travel_test,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_time_paradox",
        ),
      ),
    ],
  },
  eternia31349_divining_chambers_ask_about_this_era: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "This era",
    flavourText: "How did Eternia come to be?",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_creation_magic",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_time_paradox",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_foresee_time_travel_test",
        ),
      ]),
    ],
  },
  eternia31349_divining_chambers_no_history_books_about_eternia: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "«Are there no history books about Eternia?»",
    flavourText: "In your era, there's no Eternia — only Arcadia",
    skill: "social",
    weight: 1050,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_ask_about_this_era",
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_foresee_time_travel_test",
      ),
    ],
  },
  eternia31349_divining_chambers_research_and_strive_for_knowledge: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "«Research and strive for knowledge»",
    flavourText:
      "This god wants you to find anything you can and share your knowledge",
    skill: "perception",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_no_history_books_about_eternia",
      ),
    ],
  },
  eternia31349_divining_chambers_plant_seeds: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Plant seeds",
    flavourText:
      "For something to be findable it has to exist. There is nothing on Eternia in Arcadia",
    skill: "social",
    weight: 1250,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_research_and_strive_for_knowledge",
      ),
    ],
  },
  eternia31349_divining_chambers_leave_something: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "«We will leave something»",
    flavourText:
      "Since you've been brought here by the book, we will make more. H'Shak will be guided",
    skill: "social",
    weight: 1300,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_plant_seeds",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.GOD_TRIES_TO_PRESERVE_HISTORY,
        "1",
      ),
      COMPLETION_EFFECTS.reachMilestone("eternia31349_meddling"),
    ],
  },
  eternia31349_divining_chambers_gods_united: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Gods united",
    flavourText:
      "«We let the humans — hunters, gatherers — into an era of prosperity a thousand years ago»",
    skill: "social",
    weight: 1050,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.or([
        STANDARD_GODS_UNITED_ROUTE,
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_discuss_tales_of_eternia",
        ),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.god_of_war,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.god_of_control,
      ),
    ],
  },
  eternia31349_divining_chambers_discuss_god_of_control: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Control",
    flavourText:
      "One of gods manages the Eternia — and the entire district supports him",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_divining_chambers_gods_united",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.god_of_control,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.control_district,
      ),
    ],
  },
  eternia31349_divining_chambers_walk_away: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Walk away",
    flavourText:
      "God falls silent for now. There is more to learn elsewhere in Eternia",
    skill: "exploration",
    weight: 300,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(DIVINING_CHAMBERS),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_leave_something",
        ),
        CONDITION_CHECKS.ifActionCompleteRun(
          "eternia31349_divining_chambers_discuss_god_of_control",
        ),
      ]),
    ],
  },
};
