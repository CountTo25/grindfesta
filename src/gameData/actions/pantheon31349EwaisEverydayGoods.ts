import {
  AVAILABILITY,
  COMPLETION_EFFECTS,
  CONDITION_CHECKS,
  REVEAL,
} from "../../utils";
import type { GameState } from "../../types";
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
const HAS_AUREXITE_BEAD = CONDITION_CHECKS.or([
  CONDITION_CHECKS.hasItem("eternia31349_aurexite_beads", 1),
  CONDITION_CHECKS.hasItem("eternia31349_spare_aurexite_bead", 1),
]);

const consumeAurexiteBead = (state: GameState) => {
  const itemId =
    (state.data.run.inventory.eternia31349_spare_aurexite_bead?.amount ?? 0) >
    0
      ? "eternia31349_spare_aurexite_bead"
      : "eternia31349_aurexite_beads";
  return COMPLETION_EFFECTS.removeItem(itemId, 1)(state);
};

export const pantheon31349EwaisEverydayGoodsActions: ActionRepository = {
  eternia31349_ewai_introduce: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Introduce yourself",
    flavourText: "The selection is rather obscure",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.ewaisEverydayGoods,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.reachMilestone("eternia31349_meet_ewai"),
    ],
  },
  eternia31349_ewai_ask_about_payment: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Ask about payment",
    flavourText: "Wait, they have banking?",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.ewaisEverydayGoods,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("eternia31349_ewai_introduce"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.PANTHEON31349.currency),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.PANTHEON31349.currency),
    ],
  },
  eternia31349_ewai_buy_aurexite_beads: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy Aurexite beads",
    flavourText: "Said to improve channeling. Aurexite for sale it is to you",
    skill: "social",
    weight: 1200,
    ...REVEAL.all([
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.currency),
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.language_basics),
      REVEAL.item("eternia31349_gald", 200),
      REVEAL.itemNotCappedYet("eternia31349_aurexite_beads"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.ewaisEverydayGoods,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("eternia31349_ewai_introduce"),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasItem("eternia31349_aurexite_beads", 1),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("eternia31349_gald", 200),
      COMPLETION_EFFECTS.addItem("eternia31349_aurexite_beads", 1),
    ],
  },
  eternia31349_ewai_buy_spare_aurexite_bead: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Buy a spare bead",
    flavourText: "More aurexite!",
    skill: "social",
    weight: 300,
    ...REVEAL.all([
      REVEAL.hasKnowledge(KNOWLEDGE.PANTHEON31349.language_basics),
      REVEAL.item("eternia31349_gald", 40),
      REVEAL.itemNotCappedYet("eternia31349_spare_aurexite_bead"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.ewaisEverydayGoods,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_ewai_buy_aurexite_beads",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("eternia31349_gald", 40),
      COMPLETION_EFFECTS.addItem("eternia31349_spare_aurexite_bead", 1),
    ],
  },
  eternia31349_ewai_transfer_energy_from_aurexite: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Transfer energy from Aurexite",
    flavourText: "Grants 2 energy",
    skill: "magic",
    weight: 50,
    ...AVAILABILITY.energyRoom(2),
    conditions: [
      HAS_AUREXITE_BEAD,
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.energy_manipulation,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.aurexite_energy,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.aurexite_structural_properties,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_marco_theorise_energy_transfer",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.restoreEnergy(2),
      consumeAurexiteBead,
    ],
  },
  eternia31349_ewai_distill_low_grade_aurexite: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Distill energy from low grade Aurexite",
    flavourText: "Not much, but still. Adds 1 energy",
    skill: "magic",
    weight: 80,
    ...AVAILABILITY.energyRoom(1),
    conditions: [
      CONDITION_CHECKS.hasItem("bbasin7281_rough_aurexite_chunk", 1),
      CONDITION_CHECKS.flag(TAGS.PANTHEON31349.MAGIC_IMBUED),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.energy_manipulation,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.aurexite_energy,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.aurexite_structural_properties,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "na641_marco_theorise_energy_transfer",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.restoreEnergy(1),
      COMPLETION_EFFECTS.removeItem("bbasin7281_rough_aurexite_chunk", 1),
    ],
  },
};
