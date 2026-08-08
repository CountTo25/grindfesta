import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
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
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;
const ACCOUNT_OPEN_THIS_RUN = CONDITION_CHECKS.ifActionCompleteRun(
  "eternia31349_bank_apply_for_account",
);
const CARD_SYSTEM_KNOWN = CONDITION_CHECKS.ifActionCompleteAny(
  "eternia31349_bank_ask_about_card",
);

export const pantheon31349BankActions: ActionRepository = {
  eternia31349_bank_apply_for_account: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Apply for an account",
    flavourText: "I guess you'll need a card too",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.bankBranch),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.PANTHEON31349.BANK_ACCOUNT_INFO, "1"),
    ],
  },
  eternia31349_bank_ask_about_card: {
    ...CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Ask about card",
    flavourText: "Wait, there's no card? You need to use magic?",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.bankBranch),
      ACCOUNT_OPEN_THIS_RUN,
    ],
  },
  eternia31349_bank_try_test_transaction: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Try making a test transaction",
    flavourText: "This is hilariously convenient",
    skill: "magic",
    weight: 15,
    ...REVEAL.all([
      REVEAL.runFlag(
        TAGS.PANTHEON31349.MAGIC_IMBUED,
        "Requires being imbued with magic",
      ),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.control_basics),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.manipulation_basics),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.bankBranch),
      ACCOUNT_OPEN_THIS_RUN,
      CARD_SYSTEM_KNOWN,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_usage_basics,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.currency_operation,
      ),
    ],
  },
  eternia31349_bank_ask_about_learning_basics: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about learning basics",
    flavourText: "You feel incredibly dumb",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(ETERNIA31349_SUBLOCATIONS.bankBranch),
      ACCOUNT_OPEN_THIS_RUN,
      CARD_SYSTEM_KNOWN,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_usage_basics,
      ),
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.not(
          CONDITION_CHECKS.hasKnowledge(
            KNOWLEDGE.PANTHEON31349.control_basics,
          ),
        ),
        CONDITION_CHECKS.not(
          CONDITION_CHECKS.hasKnowledge(
            KNOWLEDGE.PANTHEON31349.manipulation_basics,
          ),
        ),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_archives_location,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.introduction_to_control_location,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_manipulation_location,
      ),
    ],
  },
};
