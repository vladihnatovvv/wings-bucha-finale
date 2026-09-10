import { createServerFn } from "@tanstack/react-start";
import type {
  ConstructionUpdate,
  Lead,
  LeadStatus,
  SiteContacts,
  SiteDocument,
  SiteSettings,
} from "@/lib/admin-store";
import type { House, HouseType } from "@/lib/houses";

async function requireAdmin() {
  const auth = await import("./server/admin-auth");
  auth.requireAdmin();
}

export const checkAdminAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await import("./server/admin-auth");
  return auth.getAdminAuthState();
});

export const loginAdminFn = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const auth = await import("./server/admin-auth");
    return auth.loginAdmin(data.password);
  });

export const logoutAdminFn = createServerFn({ method: "POST" }).handler(async () => {
  const auth = await import("./server/admin-auth");
  return auth.logoutAdmin();
});

export const listHousesFn = createServerFn({ method: "GET" }).handler(async () => {
  const repo = await import("./server/content-repository");
  return repo.listHouses();
});

export const getHouseByIdFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const repo = await import("./server/content-repository");
    return repo.getHouseById(data.id);
  });

export const saveHouseFn = createServerFn({ method: "POST" })
  .validator((data: House) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.saveHouse(data);
  });

export const deleteHouseFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.deleteHouse(data.id);
  });

export const listHouseTypesFn = createServerFn({ method: "GET" }).handler(async () => {
  const repo = await import("./server/content-repository");
  return repo.listHouseTypes();
});

export const saveHouseTypeFn = createServerFn({ method: "POST" })
  .validator((data: HouseType) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.saveHouseType(data);
  });

export const listLeadsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const repo = await import("./server/content-repository");
  return repo.listLeads();
});

export const createLeadFn = createServerFn({ method: "POST" })
  .validator((data: Omit<Lead, "id" | "createdAt" | "status">) => data)
  .handler(async ({ data }) => {
    const repo = await import("./server/content-repository");
    return repo.createLead(data);
  });

export const updateLeadStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: LeadStatus }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.updateLeadStatus(data.id, data.status);
  });

export const readSiteContactsFn = createServerFn({ method: "GET" }).handler(async () => {
  const repo = await import("./server/content-repository");
  return repo.readSiteContacts();
});

export const writeSiteContactsFn = createServerFn({ method: "POST" })
  .validator((data: SiteContacts) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.writeSiteContacts(data);
  });

export const listSiteDocumentsFn = createServerFn({ method: "GET" }).handler(async () => {
  const repo = await import("./server/content-repository");
  return repo.listSiteDocuments();
});

export const saveSiteDocumentFn = createServerFn({ method: "POST" })
  .validator((data: SiteDocument) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.saveSiteDocument(data);
  });

export const deleteSiteDocumentFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.deleteSiteDocument(data.id);
  });

export const listConstructionUpdatesFn = createServerFn({ method: "GET" }).handler(async () => {
  const repo = await import("./server/content-repository");
  return repo.listConstructionUpdates();
});

export const saveConstructionUpdateFn = createServerFn({ method: "POST" })
  .validator((data: ConstructionUpdate) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.saveConstructionUpdate(data);
  });

export const deleteConstructionUpdateFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.deleteConstructionUpdate(data.id);
  });

export const readSiteSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const repo = await import("./server/content-repository");
  return repo.readSiteSettings();
});

export const writeSiteSettingsFn = createServerFn({ method: "POST" })
  .validator((data: SiteSettings) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const repo = await import("./server/content-repository");
    return repo.writeSiteSettings(data);
  });

export const uploadAdminImageFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const file = data.get("file");
    if (!(file instanceof File)) {
      throw new Error("Image file is required");
    }

    const uploads = await import("./server/uploads");
    return uploads.saveUploadedImage(file);
  });

export const uploadAdminFileFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const file = data.get("file");
    if (!(file instanceof File)) {
      throw new Error("File is required");
    }

    const uploads = await import("./server/uploads");
    return uploads.saveUploadedFile(file);
  });
