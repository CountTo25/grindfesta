export const LOCATIONS = {
  na641: "New Arcadia 641",
  bbasin7281: "Ashbone Basin -7281",
  pantheon31349: "Pantheon Age -31349",
} as const;

export const SUBLOCATIONS = {
  na641: {
    westernMainStreetAlley: "Western main street alley",
    westernMainStreet: "Western main street",
    professorNaotosHouse: "Western Main Street — Professor Naoto's house",
    marcosWorkshop: "Marco's Workshop",
    nawsHistoryMuseum: "NAWS History Museum",
    nawsHistoryMuseumMainHall: "NAWS History Museum — Main Hall",
    nawsHistoryMuseumBackrooms: "NAWS History Museum — Backrooms",
    nawsHistoryMuseumPaleontologyExhibitStorage:
      "NAWS History Museum — Paleontology exhibit storage",
    nawsHistoryMuseumMaintenanceRoom: "NAWS History Museum — Maintenance room",
    rapidDeliveryService: "Rapid Delivery Service",
    rapidDeliverySpecialStorage:
      "Rapid Delivery Service — Special delivery storage",
    southernMainStreetOutskirts: "Southern main street outskirts",
    johnnysGangHideout:
      "Southern main street outskirts — Johnny's Gang Hideout",
    annasRecycledGoods: "Anna's Recycled Goods",
    southernMainStreet: "Southern main street",
    southernMainStreetLibrary: "Southern main street — Library",
    southernMainStreetLibraryMasterLibrarianChambers:
      "Southern Main Street — Library — Master Librarian chambers",
    southernMainStreetLeatherworks: "Southern Main Street — Leatherworks",
    southernMainStreetDepartmentStore: "Southern main street — Department store",
    southernMainStreetDepartmentStoreTechStore:
      "Southern main street — Department store — Tech store",
    southernMainStreetDepartmentStoreAccessoryStore:
      "Southern main street — Department store — Accessory store",
    southernMainStreetDepartmentStoreCampingGoodsStore:
      "Southern main street — Department store — Camping goods store",
    southernMainStreetUpperLayerElevator:
      "Southern main street — Upper layer elevator",
    cityHall: "City Hall",
    upperLayer: "Upper layer",
  },
  bbasin7281: {
    sulfurSprings: "Ashbone Basin -7281 — Sulfur springs",
    canyon: "Ashbone Basin -7281 — Canyon",
  },
  pantheon31349: {
    greatLibrary: "Pantheon Age -31349 — Great Library",
  },
} as const;

export type KnownLocation = (typeof LOCATIONS)[keyof typeof LOCATIONS];
type SubLocationGroups = typeof SUBLOCATIONS;
export type KnownSubLocation = {
  [Group in keyof SubLocationGroups]: SubLocationGroups[Group][keyof SubLocationGroups[Group]];
}[keyof SubLocationGroups];
export type Na641SubLocation =
  (typeof SUBLOCATIONS.na641)[keyof typeof SUBLOCATIONS.na641];
