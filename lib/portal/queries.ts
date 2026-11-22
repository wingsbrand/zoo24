// Dostęp serwerowy: widoczność portalu i linki usług z magazynu.
import type { GroupSlug } from "../taxonomy/animals";
import { getStore } from "../store/file-store";
import { computeVisibility, type PortalVisibility } from "./visibility";
import { serviceLinks, type ServiceLinks } from "./services";

export function portalVisibility(): PortalVisibility {
  return computeVisibility(getStore().read().articles);
}

export function storeServiceLinks(petGroup?: GroupSlug): ServiceLinks {
  return serviceLinks(getStore().read().businesses, petGroup);
}
