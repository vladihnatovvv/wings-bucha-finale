import { getRouteApi } from "@tanstack/react-router";
import type {
  ConstructionUpdate,
  SiteContacts,
  SiteDocument,
  SiteSettings,
} from "@/lib/admin-store";
import type { House, HouseType } from "@/lib/houses";

/**
 * Everything the public pages need, loaded once per navigation by the root route loader.
 * It is rendered on the server (so it is in the first HTML) and cached in the browser,
 * so components never fetch their own copies.
 */
export type PublicContent = {
  houses: House[];
  houseTypes: HouseType[];
  contacts: SiteContacts;
  settings: SiteSettings;
  documents: SiteDocument[];
  constructionUpdates: ConstructionUpdate[];
};

const rootApi = getRouteApi("__root__");

export function useSiteContent(): PublicContent {
  return rootApi.useLoaderData() as PublicContent;
}

export function houseTypeLabel(types: HouseType[], id: string) {
  return types.find((type) => type.id === id)?.label ?? id;
}
