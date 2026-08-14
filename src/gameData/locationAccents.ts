import {
  LOCATIONS,
  type KnownLocation,
  type LocationKey,
} from "./sublocations";

const LOCATION_ACCENTS_BY_KEY = {
  na641: "var(--ui_accent_new_arcadia)",
  bbasin7281: "var(--ui_accent_ashbone_basin)",
  eternia31349: "var(--ui_accent_pantheon_age)",
  eterniaSilent29624: "var(--ui_accent_eternia_silent)",
} satisfies Record<LocationKey, string>;

const LOCATION_ACCENTS = Object.fromEntries(
  (Object.keys(LOCATIONS) as LocationKey[]).map((key) => [
    LOCATIONS[key],
    LOCATION_ACCENTS_BY_KEY[key],
  ]),
) as Record<KnownLocation, string>;

export function getLocationAccentByKey(key: LocationKey): string {
  return LOCATION_ACCENTS_BY_KEY[key];
}

export function getLocationAccent(location: KnownLocation): string {
  return LOCATION_ACCENTS[location];
}
