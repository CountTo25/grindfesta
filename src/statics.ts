import { bbasin7281Actions } from "./gameData/actions/bbasin7281";
import { pantheon31349BankActions } from "./gameData/actions/pantheon31349Bank";
import { pantheon31349DiviningChambersActions } from "./gameData/actions/pantheon31349DiviningChambers";
import { pantheon31349EwaisEverydayGoodsActions } from "./gameData/actions/pantheon31349EwaisEverydayGoods";
import { pantheon31349GodOfKnowledgeActions } from "./gameData/actions/pantheon31349GodOfKnowledge";
import { pantheon31349LibraryActions } from "./gameData/actions/pantheon31349Library";
import { pantheon31349LibraryJobActions } from "./gameData/actions/pantheon31349LibraryJobs";
import { pantheon31349MagicianLodgesActions } from "./gameData/actions/pantheon31349MagicianLodges";
import { pantheon31349MagicArchivesActions } from "./gameData/actions/pantheon31349MagicArchives";
import { pantheon31349ScholarsDistrictActions } from "./gameData/actions/pantheon31349ScholarsDistrict";
import {
  na641BackalleyActions,
  na641WesternMainStreetActions,
} from "./gameData/actions/na641backalley";
import { na641CityHallActions } from "./gameData/actions/na641cityHall";
import { departmentStoreActions } from "./gameData/actions/na641departmentStore";
import { na641junkActions } from "./gameData/actions/na641junk";
import { masterLibrarianActions } from "./gameData/actions/na641masterLibrarian";
import { marcosWorkshopActions } from "./gameData/actions/na641marcos";
import { museumActions } from "./gameData/actions/na641museum";
import { museumBackroomsActions } from "./gameData/actions/na641museumBackrooms";
import { professorNaotoActions } from "./gameData/actions/na641professorNaoto";
import { rapidDeliveryActions } from "./gameData/actions/na641rapid";
import { na641southActions } from "./gameData/actions/na641south";
import { na641southernMainStreetActions } from "./gameData/actions/na641southernMainStreet";
import type { ActionRepository } from "./gameData/actions/utils";

export const actions: ActionRepository = {
  ...na641WesternMainStreetActions,
  ...professorNaotoActions,
  ...marcosWorkshopActions,
  ...na641BackalleyActions,
  ...na641CityHallActions,
  ...museumActions,
  ...museumBackroomsActions,
  ...rapidDeliveryActions,
  ...na641southernMainStreetActions,
  ...masterLibrarianActions,
  ...departmentStoreActions,
  ...na641southActions,
  ...na641junkActions,
  ...bbasin7281Actions,
  ...pantheon31349BankActions,
  ...pantheon31349GodOfKnowledgeActions,
  ...pantheon31349DiviningChambersActions,
  ...pantheon31349EwaisEverydayGoodsActions,
  ...pantheon31349LibraryActions,
  ...pantheon31349LibraryJobActions,
  ...pantheon31349MagicianLodgesActions,
  ...pantheon31349MagicArchivesActions,
  ...pantheon31349ScholarsDistrictActions,
};
