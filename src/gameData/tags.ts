export const DELIVERY_TAGS = {
  junk_delivery: "narcadia_junk_delivery",
  active_order: "narcadia_delivery_active_order",
};

export const TAGS = {
  NA641: {
    SUS_LEVEL: "na641_suspicion",
    DELIVERY: DELIVERY_TAGS,
    JUNK: {
      RADIO: "junk_radio_fixed",
      FIX_COUNT: "na641_junk_fix_count",
    },
    REPUTATION: {
      HOMELESS: "na641_rep_homeless",
    },
  },
  MODIFIERS: {
    HAS_JUNK_WALLET: "has_junk_wallet",
  },
};

export const KNOWLEDGE = {
  NA641: {
    southern_outskirts: "na641_west_to_southern_street_connection",
    junk_shop_location: "na641_junk_shop_location",
    southern_vendomats: "na641_vendomat_info",
    johnny_contact: "na641_johnny_contact",
  },
};
