import type { GameState } from "../types";
import {
  LOCATIONS,
  SUBLOCATIONS,
  type KnownSubLocation,
  type LocationKey,
} from "./sublocations";

const MURMUR_COOLDOWN_MS = 60_000;
const MURMUR_MEAN_WAIT_MS = 30_000;
const BBASIN_OUTDOOR_MURMURS = [
  "*Wind blows*",
  "You hear a faint roar far away",
  "Rocks fell off the cliff",
  "A suspiciously large bird flew over you",
] as const;

export type MurmurRepository = {
  [LocationKey in keyof typeof SUBLOCATIONS]?: Partial<
    Record<keyof (typeof SUBLOCATIONS)[LocationKey], readonly string[]>
  >;
};

export const murmurs = {
  na641: {
    westernMainStreet: [
      "...get the best cookies....",
      "You hear faint sirens in distance",
      "Some guys are arguing over latest newspaper",
      "...his goons are at it again...",
      "Something fell off the top level",
    ],
  },
  bbasin7281: {
    sulfurSprings: BBASIN_OUTDOOR_MURMURS,
    canyon: BBASIN_OUTDOOR_MURMURS,
  },
  eternia31349: {
    greatLibrary: [
      "*Cough*",
      "*Pages turn*",
      "Someone just dropped a book",
    ],
    scholarsDistrict: [
      "...Did you hear about those grapes?..",
      "...Recent prophecies are worrying!..",
      "Someone just conjured some ice",
    ],
  },
} as const satisfies MurmurRepository;

type MurmurPool = {
  key: string;
  entries: readonly string[];
};

function getMurmurPool(state: GameState): MurmurPool | null {
  const repository: MurmurRepository = murmurs;

  for (const locationKey of Object.keys(repository) as LocationKey[]) {
    if (LOCATIONS[locationKey] !== state.data.run.location) continue;

    const locationMurmurs = repository[locationKey] as
      | Partial<Record<string, readonly string[]>>
      | undefined;
    const locationSublocations = SUBLOCATIONS[locationKey] as unknown as Record<
      string,
      KnownSubLocation
    >;

    for (const [subLocationKey, entries] of Object.entries(
      locationMurmurs ?? {},
    )) {
      if (
        entries &&
        locationSublocations[subLocationKey] === state.data.run.subLocation
      ) {
        return {
          key: `${locationKey}.${subLocationKey}`,
          entries,
        };
      }
    }
  }

  return null;
}

export function applyMurmurTick(
  state: GameState,
  tickMs: number,
  random: () => number = Math.random,
): GameState {
  const pool = getMurmurPool(state);
  if (!pool || pool.entries.length === 0) return state;

  const cooldownRemaining = Math.max(
    0,
    (state.data.run.murmurCooldowns[pool.key] ?? 0) - tickMs,
  );
  state.data.run.murmurCooldowns[pool.key] = cooldownRemaining;
  if (cooldownRemaining > 0) return state;

  const spawnChance = 1 - Math.exp(-tickMs / MURMUR_MEAN_WAIT_MS);
  if (random() >= spawnChance) return state;

  const entryIndex = Math.min(
    pool.entries.length - 1,
    Math.floor(random() * pool.entries.length),
  );
  state.data.run.logEntries.push({
    ts: state.data.run.timeSpent,
    text: pool.entries[entryIndex],
  });
  state.data.run.murmurCooldowns[pool.key] = MURMUR_COOLDOWN_MS;

  return state;
}
