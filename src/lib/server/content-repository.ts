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
  DEFAULT_SITE_SETTINGS,
  type ConstructionUpdate,
  type Lead,
  type LeadStatus,
  type SiteContacts,
  type SiteDocument,
  type SiteSettings,
} from "@/lib/admin-store";
import { DEFAULT_HOUSE_TYPES, DEFAULT_HOUSES, type House, type HouseType } from "@/lib/houses";
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
    img: row.img,
    facade: row.facade,
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

function toConstructionUpdate(row: DbConstructionUpdate): ConstructionUpdate {
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    title: row.title,
    description: row.description,
    image: row.image,
    progress: row.progress,
    sortOrder: row.sortOrder,
  };
}

function toSiteSettings(row: DbSiteSettings): SiteSettings {
  return {
    scrollMediaVideoUrl: row.scrollMediaVideoUrl,
  };
}

async function ensureDefaults() {
  requireDb();

  await Promise.all(
    DEFAULT_HOUSE_TYPES.map((type) =>
      prisma.houseType.upsert({
        where: { id: type.id },
        update: {},
        create: type,
      }),
    ),
  );

  const housesCount = await prisma.house.count();
  if (housesCount === 0) {
    await prisma.house.createMany({
      data: DEFAULT_HOUSES.map((house) => ({
        id: house.id,
        name: house.name,
        type: house.type,
        img: house.img,
        facade: house.facade,
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
      })),
    });
  }

  await prisma.siteContacts.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_CONTACTS },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_SITE_SETTINGS },
  });

  const documentsCount = await prisma.siteDocument.count();
  if (documentsCount === 0) {
    await prisma.siteDocument.createMany({ data: DEFAULT_DOCUMENTS });
  }

  const constructionCount = await prisma.constructionUpdate.count();
  if (constructionCount === 0) {
    await prisma.constructionUpdate.createMany({
      data: DEFAULT_CONSTRUCTION_UPDATES.map((item) => ({
        ...item,
        date: new Date(`${item.date}T00:00:00.000Z`),
      })),
    });
  }
}

export async function listHouses(): Promise<House[]> {
  if (!hasDatabaseUrl()) return DEFAULT_HOUSES;
  await ensureDefaults();
  const rows = await prisma.house.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toHouse);
}

export async function getHouseById(id: string): Promise<House | undefined> {
  if (!hasDatabaseUrl()) return DEFAULT_HOUSES.find((house) => house.id === id);
  await ensureDefaults();
  const row = await prisma.house.findUnique({ where: { id } });
  return row ? toHouse(row) : undefined;
}

export async function saveHouse(house: House): Promise<House> {
  requireDb();
  const row = await prisma.house.upsert({
    where: { id: house.id },
    update: {
      name: house.name,
      type: house.type,
      img: house.img,
      facade: house.facade,
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
  });
  return toHouse(row);
}

export async function deleteHouse(id: string) {
  requireDb();
  await prisma.house.delete({ where: { id } });
  return { ok: true };
}

export async function listHouseTypes(): Promise<HouseType[]> {
  if (!hasDatabaseUrl()) return DEFAULT_HOUSE_TYPES;
  await ensureDefaults();
  const rows = await prisma.houseType.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toHouseType);
}

export async function saveHouseType(type: HouseType): Promise<HouseType> {
  requireDb();
  const row = await prisma.houseType.upsert({
    where: { id: type.id },
    update: { label: type.label, pluralLabel: type.pluralLabel },
    create: type,
  });
  return toHouseType(row);
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
  await ensureDefaults();
  const row = await prisma.siteContacts.findUnique({ where: { id: 1 } });
  return row ? toSiteContacts(row) : DEFAULT_CONTACTS;
}

export async function writeSiteContacts(contacts: SiteContacts): Promise<SiteContacts> {
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
  await ensureDefaults();
  const rows = await prisma.siteDocument.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toSiteDocument);
}

export async function saveSiteDocument(document: SiteDocument): Promise<SiteDocument> {
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

export async function deleteSiteDocument(id: string) {
  requireDb();
  await prisma.siteDocument.delete({ where: { id } });
  return { ok: true };
}

export async function listConstructionUpdates(): Promise<ConstructionUpdate[]> {
  if (!hasDatabaseUrl()) return DEFAULT_CONSTRUCTION_UPDATES;
  await ensureDefaults();
  const rows = await prisma.constructionUpdate.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toConstructionUpdate);
}

export async function saveConstructionUpdate(
  update: ConstructionUpdate,
): Promise<ConstructionUpdate> {
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

export async function deleteConstructionUpdate(id: string) {
  requireDb();
  await prisma.constructionUpdate.delete({ where: { id } });
  return { ok: true };
}

export async function readSiteSettings(): Promise<SiteSettings> {
  if (!hasDatabaseUrl()) return DEFAULT_SITE_SETTINGS;
  await ensureDefaults();
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return row ? toSiteSettings(row) : DEFAULT_SITE_SETTINGS;
}

export async function writeSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  requireDb();
  const row = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: settings,
    create: { id: 1, ...settings },
  });
  return toSiteSettings(row);
}
