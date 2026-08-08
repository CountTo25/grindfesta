import { COMPLETION_EFFECTS, CONDITION_CHECKS, REVEAL } from "../../utils";
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

const NA641 = LOCATIONS.na641;
const NA641_SUBLOCATIONS = SUBLOCATIONS.na641;

const IN_DEPARTMENT_STORE = [
  CONDITION_CHECKS.inLocation(NA641),
  CONDITION_CHECKS.inSubLocation(
    NA641_SUBLOCATIONS.southernMainStreetDepartmentStore,
  ),
];

const HAS_VISITED_BASIN = CONDITION_CHECKS.or([
  CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.visited),
  CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.BBASIN7281.fossil_origins),
]);

const IN_CAMPING_GOODS_STORE = [
  CONDITION_CHECKS.inLocation(NA641),
  CONDITION_CHECKS.inSubLocation(
    NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreCampingGoodsStore,
  ),
];

function trackSpentCoins(value: number) {
  return COMPLETION_EFFECTS.patchFlagNumeric(
    TAGS.NA641.DEPARTMENT_STORE.SPENT,
    (v) => v + value,
  );
}

function suggestPointCardIfEligible() {
  return COMPLETION_EFFECTS.if(
    (d) =>
      CONDITION_CHECKS.numFlagGTE(
        TAGS.NA641.DEPARTMENT_STORE.SPENT,
        30,
      )(d) &&
      CONDITION_CHECKS.noFlag(
        TAGS.NA641.DEPARTMENT_STORE.POINT_CARD_SUGGESTED,
      )(d),
    (d) => {
      COMPLETION_EFFECTS.addLog(
        "Staff suggested you register for member's card for discounts",
      )(d);
      return COMPLETION_EFFECTS.addFlag(
        TAGS.NA641.DEPARTMENT_STORE.POINT_CARD_SUGGESTED,
        "1",
      )(d);
    },
  );
}

function trackStorePurchase(value: number) {
  return [trackSpentCoins(value), suggestPointCardIfEligible()];
}

function hasPointCard(state: GameState) {
  return CONDITION_CHECKS.flag(TAGS.NA641.DEPARTMENT_STORE.POINT_CARD)(state);
}

function getDepartmentStorePrice(
  state: GameState,
  normalPrice: number,
  pointCardPrice: number,
) {
  return hasPointCard(state) ? pointCardPrice : normalPrice;
}

function departmentStorePriceText(
  normalPrice: number,
  pointCardPrice: number,
  text: string,
) {
  return (state: GameState) => {
    let price = getDepartmentStorePrice(state, normalPrice, pointCardPrice);
    let priceKind = hasPointCard(state) ? "" : ". Department store markup";
    return `${price} Zenny${priceKind}${text ? `. ${text}` : ""}`;
  };
}

function removeDepartmentStoreCoins(
  normalPrice: number,
  pointCardPrice: number,
) {
  return (state: GameState) => {
    let price = getDepartmentStorePrice(state, normalPrice, pointCardPrice);
    return COMPLETION_EFFECTS.removeItem("narcadia641_zenny", price)(state);
  };
}

function trackDepartmentStorePurchase(
  normalPrice: number,
  pointCardPrice: number,
) {
  return (state: GameState) => {
    let price = getDepartmentStorePrice(state, normalPrice, pointCardPrice);
    return trackSpentCoins(price)(state);
  };
}

function revealDepartmentStorePrice(
  normalPrice: number,
  pointCardPrice: number,
) {
  return {
    revealCondition: [
      (state: GameState) =>
        (state.data.run.inventory.narcadia641_zenny?.amount ?? 0) >=
        getDepartmentStorePrice(state, normalPrice, pointCardPrice),
    ],
    revealConditionExplained: [
      (state: GameState) =>
        `Requires ${getDepartmentStorePrice(
          state,
          normalPrice,
          pointCardPrice,
        )} of Zenny`,
    ],
  };
}

export const departmentStoreActions: ActionRepository = {
  na641_department_store_look_around: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look around",
    flavourText: "Lets see whats in store!",
    skill: "perception",
    weight: 210,
    conditions: [...IN_DEPARTMENT_STORE],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.department_store_tech_store,
      ),
    ],
  },
  na641_department_store_look_around_more: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Look around more",
    flavourText: "What else there is?",
    skill: "perception",
    weight: 450,
    conditions: [
      ...IN_DEPARTMENT_STORE,
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_department_store_look_around",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.department_store_accessory_store,
      ),
      COMPLETION_EFFECTS.addKnowledge(KNOWLEDGE.NA641.department_store_staff),
    ],
  },
  na641_department_store_talk_with_staff: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Talk with staff",
    flavourText: "Lets ask someone knowledgeable this time",
    skill: "social",
    weight: 600,
    conditions: [
      ...IN_DEPARTMENT_STORE,
      CONDITION_CHECKS.ifActionCompleteAny(
        "na641_department_store_look_around_more",
      ),
      CONDITION_CHECKS.hasKnowledge(KNOWLEDGE.NA641.department_store_staff),
      HAS_VISITED_BASIN,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.department_store_camping_goods_store,
      ),
    ],
  },
  na641_department_store_apply_point_card: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Apply for point card",
    flavourText:
      "Deals on tech store goods! Limited to customers who spent more than 30Z today!",
    skill: "social",
    weight: 300,
    conditions: [
      ...IN_DEPARTMENT_STORE,
      CONDITION_CHECKS.flag(
        TAGS.NA641.DEPARTMENT_STORE.POINT_CARD_SUGGESTED,
      ),
      CONDITION_CHECKS.noFlag(TAGS.NA641.DEPARTMENT_STORE.POINT_CARD),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(TAGS.NA641.DEPARTMENT_STORE.POINT_CARD, "1"),
      COMPLETION_EFFECTS.addLog(
        "You are now registered for the department store point card",
      ),
    ],
  },
  na641_department_store_visit_tech_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit tech store",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      ...IN_DEPARTMENT_STORE,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.department_store_tech_store,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreTechStore,
      ),
    ],
  },
  na641_department_store_leave_tech_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to department store",
    skill: "exploration",
    weight: 15,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreTechStore,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStore,
      ),
    ],
  },
  na641_tech_store_buy_battery: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Buy a battery",
    flavourText: departmentStorePriceText(2, 1, ""),
    skill: "social",
    idx: 10,
    weight: 35,
    ...REVEAL.all([
      revealDepartmentStorePrice(2, 1),
      REVEAL.itemNotCappedYet("small_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreTechStore,
      ),
    ],
    postComplete: [
      removeDepartmentStoreCoins(2, 1),
      COMPLETION_EFFECTS.addItem("small_battery", 1),
      trackDepartmentStorePurchase(2, 1),
      suggestPointCardIfEligible(),
    ],
  },
  na641_tech_store_buy_supercharged_battery: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Purchase supercharged battery",
    flavourText: departmentStorePriceText(6, 4, "Restores 2 energy"),
    skill: "social",
    idx: 10,
    weight: 80,
    ...REVEAL.all([
      revealDepartmentStorePrice(6, 4),
      REVEAL.itemNotCappedYet("charged_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreTechStore,
      ),
    ],
    postComplete: [
      removeDepartmentStoreCoins(6, 4),
      COMPLETION_EFFECTS.addItem("charged_battery", 1),
      trackDepartmentStorePurchase(6, 4),
      suggestPointCardIfEligible(),
    ],
  },
  na641_tech_store_buy_all_day_battery: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Purchase all-day battery",
    flavourText: departmentStorePriceText(10, 8, "Restores 4 energy"),
    skill: "social",
    idx: 10,
    weight: 140,
    ...REVEAL.all([
      revealDepartmentStorePrice(10, 8),
      REVEAL.itemNotCappedYet("all_day_battery"),
    ]),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreTechStore,
      ),
    ],
    postComplete: [
      removeDepartmentStoreCoins(10, 8),
      COMPLETION_EFFECTS.addItem("all_day_battery", 1),
      trackDepartmentStorePurchase(10, 8),
      suggestPointCardIfEligible(),
    ],
  },
  na641_department_store_visit_accessory_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit accessory store",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      ...IN_DEPARTMENT_STORE,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.department_store_accessory_store,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreAccessoryStore,
      ),
    ],
  },
  na641_department_store_leave_accessory_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to department store",
    skill: "exploration",
    weight: 15,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreAccessoryStore,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStore,
      ),
    ],
  },
  na641_accessory_store_buy_trendy_wallet: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy trendy wallet",
    flavourText: "20 Zenny. For your wealth-flaunting needs",
    skill: "social",
    idx: 10,
    weight: 300,
    ...REVEAL.item("narcadia641_zenny", 20),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreAccessoryStore,
      ),
      CONDITION_CHECKS.noFlag(TAGS.MODIFIERS.HAS_TRENDY_WALLET),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 20),
      COMPLETION_EFFECTS.addFlag(TAGS.MODIFIERS.HAS_TRENDY_WALLET, "true"),
      ...trackStorePurchase(20),
    ],
  },
  na641_accessory_store_consult_further_wallet_selection: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Consult about further wallet selection",
    skill: "social",
    weight: 400,
    ...REVEAL.skillCheck("social", 20),
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreAccessoryStore,
      ),
      CONDITION_CHECKS.flag(TAGS.MODIFIERS.HAS_TRENDY_WALLET),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.NA641.southern_main_street_leatherworks,
        ),
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.southern_main_street_leatherworks,
      ),
    ],
  },
  na641_department_store_visit_camping_goods_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Visit camping goods store",
    skill: "exploration",
    weight: 20,
    stopOnRepeat: true,
    conditions: [
      ...IN_DEPARTMENT_STORE,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.NA641.department_store_camping_goods_store,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreCampingGoodsStore,
      ),
    ],
  },
  na641_department_store_leave_camping_goods_store: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to department store",
    skill: "exploration",
    weight: 15,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(NA641),
      CONDITION_CHECKS.inSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStoreCampingGoodsStore,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        NA641_SUBLOCATIONS.southernMainStreetDepartmentStore,
      ),
    ],
  },
  na641_camping_goods_check_products: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Check out products",
    flavourText: "Lets get ready for outdoor expedition",
    skill: "perception",
    weight: 400,
    conditions: [...IN_CAMPING_GOODS_STORE],
    postComplete: [],
  },
  na641_camping_goods_consult_staff: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Consult with staff",
    flavourText: "Salesman has something to say",
    skill: "social",
    weight: 200,
    conditions: [
      ...IN_CAMPING_GOODS_STORE,
      CONDITION_CHECKS.ifActionCompleteAny("na641_camping_goods_check_products"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addLog(
        "Apparently, not that many people can leave Arcadia. Salesman was surprised to see a new face",
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.NA641.arcadia_travel_restrictions,
      ),
    ],
  },
  na641_camping_goods_buy_travel_boots: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy travel boots",
    flavourText: "20 Zenny",
    skill: "social",
    weight: 300,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 20),
      REVEAL.itemNotCappedYet("na641_travel_boots"),
    ]),
    conditions: [
      ...IN_CAMPING_GOODS_STORE,
      CONDITION_CHECKS.ifActionCompleteRun("na641_camping_goods_consult_staff"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 20),
      COMPLETION_EFFECTS.addItem("na641_travel_boots", 1),
      ...trackStorePurchase(20),
    ],
  },
  na641_camping_goods_buy_firestarter_set: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy firestarter set",
    flavourText: "20 Zenny",
    skill: "social",
    weight: 300,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 20),
      REVEAL.itemNotCappedYet("na641_firestarter_set"),
    ]),
    conditions: [
      ...IN_CAMPING_GOODS_STORE,
      CONDITION_CHECKS.ifActionCompleteRun("na641_camping_goods_consult_staff"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 20),
      COMPLETION_EFFECTS.addItem("na641_firestarter_set", 1),
      ...trackStorePurchase(20),
    ],
  },
  na641_camping_goods_buy_pocket_light: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Buy pocket light",
    flavourText: "20 Zenny. Works for a day!",
    skill: "social",
    weight: 700,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 20),
      REVEAL.itemNotCappedYet("na641_pocket_light"),
    ]),
    conditions: [
      ...IN_CAMPING_GOODS_STORE,
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.BBASIN7281.light_source_may_be_needed,
      ),
      CONDITION_CHECKS.ifActionCompleteRun("na641_camping_goods_consult_staff"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 20),
      COMPLETION_EFFECTS.addItem("na641_pocket_light", 1),
      ...trackStorePurchase(20),
    ],
  },
  na641_camping_goods_buy_solar_powered_radio: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Buy solar-powered radio",
    flavourText: "35 Zenny",
    skill: "social",
    weight: 600,
    ...REVEAL.all([
      REVEAL.item("narcadia641_zenny", 35),
      REVEAL.itemNotCappedYet("na641_solar_powered_radio"),
    ]),
    conditions: [
      ...IN_CAMPING_GOODS_STORE,
      CONDITION_CHECKS.ifActionCompleteRun("na641_camping_goods_consult_staff"),
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeItem("narcadia641_zenny", 35),
      COMPLETION_EFFECTS.addItem("na641_solar_powered_radio", 1),
      ...trackStorePurchase(35),
    ],
  },
};
