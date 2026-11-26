import type {
  House as DbHouse,
  HouseType as DbHouseType,
  Lead as DbLead,
  ConstructionUpdate as DbConstructionUpdate,
  SiteDocument as DbSiteDocument,
  SiteContacts as DbSiteContacts,
  SiteSettings as DbSiteSettings,
} from "@prisma/client";
import {
  DEFAULT_CONSTRUCTION_UPDATES,
  DEFAULT_CONTACTS,
  DEFAULT_DOCUMENTS,
  DEFAULT_SITE_SECTIONS,
  DEFAULT_SITE_SETTINGS,
  mergeSections,
  type ConstructionUpdate,
  type Lead,
  type LeadStatus,
  type SiteContacts,
  type SiteDocument,
  type SiteSections,
  type SiteSettings,
} from "@/lib/admin-store";
import {
  DEFAULT_HOUSE_TYPES,
  DEFAULT_HOUSES,
  facadeForType,
  imageForType,
  isPlaceholderImage,
  videoForType,
  type House,
  type HouseType,
} from "@/lib/houses";
import type { PublicContent } from "@/lib/site-content";
import { hasDatabaseUrl, prisma } from "./db";

function requireDb() {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured");
  }
}

function normalizePriceCurrency(value: string | null | undefined): House["priceCurrency"] {
  return value === "UAH" ? "UAH" : "USD";
}

function normalizeLeadStatus(value: string): LeadStatus {
  if (value === "in_progress" || value === "done") return value;
  return "new";
}

function asFloorPlans(value: unknown): House["floorPlans"] {
  return Array.isArray(value) ? (value as House["floorPlans"]) : [];
}

function asUnitPlans(value: unknown): House["unitPlans"] {
  return Array.isArray(value) ? (value as House["unitPlans"]) : [];
}

function toHouse(row: DbHouse): House {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    img: isPlaceholderImage(row.img) ? imageForType(row.type) : row.img,
    facade: isPlaceholderImage(row.facade) ? facadeForType(row.type) : row.facade,
    videoUrl: row.videoUrl || videoForType(row.type),
    area: row.area,
    beds: row.beds,
    baths: row.baths,
    floors: row.floors,
    plot: row.plot,
    priceUsd: row.priceUsd,
    priceUah: row.priceUah ?? undefined,
    priceCurrency: normalizePriceCurrency(row.priceCurrency),
    available: row.available,
    features: row.features,
    floorPlans: asFloorPlans(row.floorPlans),
    unitPlans: asUnitPlans(row.unitPlans),
  };
}

function toHouseType(row: DbHouseType): HouseType {
  return {
    id: row.id,
    label: row.label,
    pluralLabel: row.pluralLabel,
  };
}

function toLead(row: DbLead): Lead {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    name: row.name,
    phone: row.phone,
    email: row.email,
    interest: row.interest,
    message: row.message,
    status: normalizeLeadStatus(row.status),
  };
}

function toSiteContacts(row: DbSiteContacts): SiteContacts {
  return {
    phoneDisplay: row.phoneDisplay,
    phoneHref: row.phoneHref,
    email: row.email,
    telegramUrl: row.telegramUrl,
    whatsappUrl: row.whatsappUrl,
    facebookUrl: row.facebookUrl,
    instagramUrl: row.instagramUrl,
    tiktokUrl: row.tiktokUrl,
    address: row.address,
  };
}

function toSiteDocument(row: DbSiteDocument): SiteDocument {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fileUrl: row.fileUrl,
    sortOrder: row.sortOrder,
  };
}

const constructionImageFallback = new Map(
  DEFAULT_CONSTRUCTION_UPDATES.map((item) => [item.id, item.image]),
);

function toConstructionUpdate(row: DbConstructionUpdate): ConstructionUpdate {
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    title: row.title,
    description: row.description,
    image: row.image || constructionImageFallback.get(row.id) || "",
    progress: row.progress,
    sortOrder: row.sortOrder,
  };
}

function toSiteSettings(row: DbSiteSettings): SiteSettings {
  const sectionsContent = (row as { sectionsContent?: unknown }).sectionsContent as
    Partial<SiteSections> | null | undefined;
  return {
    scrollMediaVideoUrl: row.scrollMediaVideoUrl || DEFAULT_SITE_SETTINGS.scrollMediaVideoUrl,
    scrollMediaSound: (row as { scrollMediaSound?: boolean }).scrollMediaSound ?? true,
    heroPosterUrl: (row as { heroPosterUrl?: string }).heroPosterUrl ?? "",
    scrollPosterUrl: (row as { scrollPosterUrl?: string }).scrollPosterUrl ?? "",
    logoUrl: (row as { logoUrl?: string }).logoUrl ?? "",
    faviconUrl: (row as { faviconUrl?: string }).faviconUrl ?? "",
    ogImageUrl: (row as { ogImageUrl?: string }).ogImageUrl ?? "",
    heroVideoUrl: row.heroVideoUrl,
    sections: mergeSections(DEFAULT_SITE_SECTIONS, sectionsContent),
  };
}

export async function listHouses(): Promise<House[]> {
  if (!hasDatabaseUrl()) return DEFAULT_HOUSES;
  const rows = await prisma.house.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
  return rows.map(toHouse);
}

// Public pages read the same content on every view. It is kept in memory for a short time, so a
// traffic spike does not turn into 6 database queries per page view, and the last good copy is
// served if the database is briefly unavailable. Every admin write clears it immediately.
const PUBLIC_CONTENT_TTL_MS = 30_000;
let publicContentCache: { value: PublicContent; at: number } | null = null;

export function invalidatePublicContent() {
  if (publicContentCache) publicContentCache.at = 0;
}

async function loadPublicContent(): Promise<PublicContent> {
  const [houses, houseTypes, contacts, settings, documents, constructionUpdates] =
    await Promise.all([
      listHouses(),
      listHouseTypes(),
      readSiteContacts(),
      readSiteSettings(),
      listSiteDocuments(),
      listConstructionUpdates(),
    ]);
  return { houses, houseTypes, contacts, settings, documents, constructionUpdates };
}

export async function readPublicContent(): Promise<PublicContent> {
  if (publicContentCache && Date.now() - publicContentCache.at < PUBLIC_CONTENT_TTL_MS) {
    return publicContentCache.value;
  }
  try {
    const value = await loadPublicContent();
    publicContentCache = { value, at: Date.now() };
    return value;
  } catch (error) {
    if (publicContentCache) {
      console.error("Database unavailable, serving the last loaded public content", error);
      return publicContentCache.value;
    }
    throw error;
  }
}

export async function getHouseById(id: string): Promise<House | undefined> {
  const { houses } = await readPublicContent();
  return houses.find((house) => house.id === id);
}

async function saveHouseImpl(house: House): Promise<House> {
  requireDb();
  // New houses go to the end of the list; existing ones keep their position.
  const last = await prisma.house.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (last._max.sortOrder ?? 0) + 1;
  const row = await prisma.house.upsert({
    where: { id: house.id },
    update: {
      name: house.name,
      type: house.type,
      img: house.img,
      facade: house.facade,
      videoUrl: house.videoUrl,
      area: house.area,
      beds: house.beds,
      baths: house.baths,
      floors: house.floors,
      plot: house.plot,
      priceUsd: house.priceUsd,
      priceUah: house.priceUah,
      priceCurrency: house.priceCurrency ?? "USD",
      available: house.available,
      features: house.features,
      floorPlans: house.floorPlans,
      unitPlans: house.unitPlans,
    },
    create: {
      id: house.id,
      name: house.name,
      type: house.type,
      img: house.img,
      facade: house.facade,
      videoUrl: house.videoUrl,
      area: house.area,
      beds: house.beds,
      baths: house.baths,
      floors: house.floors,
      plot: house.plot,
      priceUsd: house.priceUsd,
      priceUah: house.priceUah,
      priceCurrency: house.priceCurrency ?? "USD",
      available: house.available,
      sortOrder: nextOrder,
      features: house.features,
      floorPlans: house.floorPlans,
      unitPlans: house.unitPlans,
    },
  });
  return toHouse(row);
}

async function reorderHousesImpl(ids: string[]) {
  requireDb();
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.house.updateMany({ where: { id }, data: { sortOrder: index + 1 } }),
    ),
  );
  return { ok: true };
}

async function deleteHouseImpl(id: string) {
  requireDb();
  await prisma.house.deleteMany({ where: { id } });
  return { ok: true };
}

export async function listHouseTypes(): Promise<HouseType[]> {
  if (!hasDatabaseUrl()) return DEFAULT_HOUSE_TYPES;
  const rows = await prisma.houseType.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toHouseType);
}

async function saveHouseTypeImpl(type: HouseType): Promise<HouseType> {
  requireDb();
  const row = await prisma.houseType.upsert({
    where: { id: type.id },
    update: { label: type.label, pluralLabel: type.pluralLabel },
    create: type,
  });
  return toHouseType(row);
}

async function deleteHouseTypeImpl(id: string) {
  requireDb();
  const used = await prisma.house.count({ where: { type: id } });
  if (used > 0) {
    throw new Error("Тип використовується в будинках. Спочатку змініть їм тип.");
  }
  await prisma.houseType.deleteMany({ where: { id } });
  return { ok: true };
}

export async function listLeads(): Promise<Lead[]> {
  if (!hasDatabaseUrl()) return [];
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toLead);
}

export async function createLead(input: Omit<Lead, "id" | "createdAt" | "status">): Promise<Lead> {
  requireDb();
  const row = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      interest: input.interest,
      message: input.message,
    },
  });
  return toLead(row);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  requireDb();
  const row = await prisma.lead.update({ where: { id }, data: { status } });
  return toLead(row);
}

export async function readSiteContacts(): Promise<SiteContacts> {
  if (!hasDatabaseUrl()) return DEFAULT_CONTACTS;
  const row = await prisma.siteContacts.findUnique({ where: { id: 1 } });
  return row ? toSiteContacts(row) : DEFAULT_CONTACTS;
}

async function writeSiteContactsImpl(contacts: SiteContacts): Promise<SiteContacts> {
  requireDb();
  const row = await prisma.siteContacts.upsert({
    where: { id: 1 },
    update: contacts,
    create: { id: 1, ...contacts },
  });
  return toSiteContacts(row);
}

export async function listSiteDocuments(): Promise<SiteDocument[]> {
  if (!hasDatabaseUrl()) return DEFAULT_DOCUMENTS;
  const rows = await prisma.siteDocument.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toSiteDocument);
}

async function saveSiteDocumentImpl(document: SiteDocument): Promise<SiteDocument> {
  requireDb();
  const row = await prisma.siteDocument.upsert({
    where: { id: document.id },
    update: {
      title: document.title,
      description: document.description,
      fileUrl: document.fileUrl,
      sortOrder: document.sortOrder,
    },
    create: document,
  });
  return toSiteDocument(row);
}

async function deleteSiteDocumentImpl(id: string) {
  requireDb();
  await prisma.siteDocument.deleteMany({ where: { id } });
  return { ok: true };
}

export async function listConstructionUpdates(): Promise<ConstructionUpdate[]> {
  if (!hasDatabaseUrl()) return DEFAULT_CONSTRUCTION_UPDATES;
  const rows = await prisma.constructionUpdate.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toConstructionUpdate);
}

async function saveConstructionUpdateImpl(update: ConstructionUpdate): Promise<ConstructionUpdate> {
  requireDb();
  const payload = {
    date: new Date(`${update.date}T00:00:00.000Z`),
    title: update.title,
    description: update.description,
    image: update.image,
    progress: update.progress,
    sortOrder: update.sortOrder,
  };
  const row = await prisma.constructionUpdate.upsert({
    where: { id: update.id },
    update: payload,
    create: { id: update.id, ...payload },
  });
  return toConstructionUpdate(row);
}

async function deleteConstructionUpdateImpl(id: string) {
  requireDb();
  await prisma.constructionUpdate.deleteMany({ where: { id } });
  return { ok: true };
}

export async function readSiteSettings(): Promise<SiteSettings> {
  if (!hasDatabaseUrl()) return DEFAULT_SITE_SETTINGS;
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return row ? toSiteSettings(row) : DEFAULT_SITE_SETTINGS;
  } catch (error) {
    console.error("Error reading site settings from DB, falling back to defaults", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

async function writeSiteSettingsImpl(settings: SiteSettings): Promise<SiteSettings> {
  requireDb();
  const payload = {
    scrollMediaVideoUrl: settings.scrollMediaVideoUrl,
    scrollMediaSound: settings.scrollMediaSound ?? true,
    heroPosterUrl: settings.heroPosterUrl ?? "",
    scrollPosterUrl: settings.scrollPosterUrl ?? "",
    logoUrl: settings.logoUrl ?? "",
    faviconUrl: settings.faviconUrl ?? "",
    ogImageUrl: settings.ogImageUrl ?? "",
    heroVideoUrl: settings.heroVideoUrl ?? "",
    sectionsContent: (settings.sections ?? DEFAULT_SITE_SECTIONS) as any,
  };

  try {
    const row = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: payload,
      create: { id: 1, ...payload },
    });
    return toSiteSettings(row);
  } catch (error) {
    console.error("Failed to save sectionsContent in DB, trying legacy update", error);
    const row = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { scrollMediaVideoUrl: settings.scrollMediaVideoUrl },
      create: { id: 1, scrollMediaVideoUrl: settings.scrollMediaVideoUrl },
    });
    return {
      scrollMediaVideoUrl: row.scrollMediaVideoUrl,
      scrollMediaSound: settings.scrollMediaSound ?? true,
      heroPosterUrl: settings.heroPosterUrl ?? "",
      scrollPosterUrl: settings.scrollPosterUrl ?? "",
      logoUrl: settings.logoUrl ?? "",
      faviconUrl: settings.faviconUrl ?? "",
      ogImageUrl: settings.ogImageUrl ?? "",
      heroVideoUrl: settings.heroVideoUrl ?? "",
      sections: settings.sections ?? DEFAULT_SITE_SECTIONS,
    };
  }
}

// Admin writes: run the write, then drop the cached public content.
function invalidating<A extends unknown[], R>(write: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    try {
      return await write(...args);
    } finally {
      invalidatePublicContent();
    }
  };
}

export const saveHouse = invalidating(saveHouseImpl);
export const deleteHouse = invalidating(deleteHouseImpl);
export const reorderHouses = invalidating(reorderHousesImpl);
export const saveHouseType = invalidating(saveHouseTypeImpl);
export const deleteHouseType = invalidating(deleteHouseTypeImpl);
export const writeSiteContacts = invalidating(writeSiteContactsImpl);
export const saveSiteDocument = invalidating(saveSiteDocumentImpl);
export const deleteSiteDocument = invalidating(deleteSiteDocumentImpl);
export const saveConstructionUpdate = invalidating(saveConstructionUpdateImpl);
export const deleteConstructionUpdate = invalidating(deleteConstructionUpdateImpl);
export const writeSiteSettings = invalidating(writeSiteSettingsImpl);
