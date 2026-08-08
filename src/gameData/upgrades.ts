export type UpgradeDescription = string | (() => string);
export type UpgradeEffect = number | (() => number);

export type TimeLeapUpgrade = {
  title: string;
  description: UpgradeDescription;
  effect: UpgradeEffect;
  cost: number;
};

export const upgrades = {
  timeline_stabilization: {
    title: "Timeline stabilization",
    description:
      "You're getting comfortable at this. Increase energy capacity by 1 per discovered milestone",
    effect: 1,
    cost: 0,
  },
} as const satisfies Record<string, TimeLeapUpgrade>;

export type UpgradeKey = keyof typeof upgrades;

export function resolveUpgradeDescription(
  description: UpgradeDescription,
): string {
  return typeof description === "function" ? description() : description;
}

export function resolveUpgradeEffect(effect: UpgradeEffect): number {
  return typeof effect === "function" ? effect() : effect;
}
