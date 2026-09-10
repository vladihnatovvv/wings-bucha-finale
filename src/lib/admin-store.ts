export type LeadStatus = "new" | "in_progress" | "done";

export type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
  status: LeadStatus;
};

export type SiteContacts = {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  telegramUrl: string;
  whatsappUrl: string;
  address: string;
};

export type SiteDocument = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  sortOrder: number;
};

export type ConstructionUpdate = {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  sortOrder: number;
};

export type SiteSettings = {
  scrollMediaVideoUrl: string;
};

export const DEFAULT_CONTACTS: SiteContacts = {
  phoneDisplay: "+38 (000) 000-00-00",
  phoneHref: "+380000000000",
  email: "info@wingsbucha.com",
  telegramUrl: "https://t.me/wingsbucha",
  whatsappUrl: "https://wa.me/380000000000",
  address: "м. Буча, вул. Лісова, 28",
};

export const DEFAULT_DOCUMENTS: SiteDocument[] = [
  {
    id: "urban-conditions",
    title: "Містобудівні умови та обмеження",
    description: "Документ, що визначає параметри забудови ділянки.",
    fileUrl: "",
    sortOrder: 10,
  },
  {
    id: "building-permit",
    title: "Дозвіл на виконання будівельних робіт",
    description: "Офіційний дозвіл ДІАМ на проведення робіт.",
    fileUrl: "",
    sortOrder: 20,
  },
  {
    id: "technical-conditions",
    title: "Технічні умови підключення",
    description: "ТУ на газ, електрику, водопостачання та каналізацію.",
    fileUrl: "",
    sortOrder: 30,
  },
  {
    id: "readiness-declaration",
    title: "Декларація готовності об'єкта",
    description: "Документ про введення черги в експлуатацію.",
    fileUrl: "",
    sortOrder: 40,
  },
];

export const DEFAULT_CONSTRUCTION_UPDATES: ConstructionUpdate[] = [
  {
    id: "phase-foundation",
    date: "2026-05-10",
    title: "Фундамент першої черги",
    description: "Завершено підготовку основи та бетонування ключових секцій.",
    image: "",
    progress: 35,
    sortOrder: 10,
  },
  {
    id: "phase-walls",
    date: "2026-06-18",
    title: "Моноліт і стіни",
    description: "Виконується зведення несучих конструкцій і зовнішніх стін.",
    image: "",
    progress: 52,
    sortOrder: 20,
  },
  {
    id: "phase-utilities",
    date: "2026-07-22",
    title: "Інженерні мережі",
    description: "Підготовлено траси під газ, електрику, воду та каналізацію.",
    image: "",
    progress: 64,
    sortOrder: 30,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  scrollMediaVideoUrl: "",
};

const CONTACTS_STORAGE_KEY = "wb_site_contacts";
const LEADS_STORAGE_KEY = "wb_leads";
const DOCUMENTS_STORAGE_KEY = "wb_site_documents";
const CONSTRUCTION_STORAGE_KEY = "wb_construction_updates";
const SETTINGS_STORAGE_KEY = "wb_site_settings";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readSiteContacts(): SiteContacts {
  if (typeof window === "undefined") return DEFAULT_CONTACTS;
  const saved = safeParse<Partial<SiteContacts>>(localStorage.getItem(CONTACTS_STORAGE_KEY), {});
  return { ...DEFAULT_CONTACTS, ...saved };
}

export function writeSiteContacts(contacts: SiteContacts) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    /* ignore */
  }
}

export function readLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  const leads = safeParse<Lead[]>(localStorage.getItem(LEADS_STORAGE_KEY), []);
  return Array.isArray(leads) ? leads : [];
}

export function writeLeads(leads: Lead[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch {
    /* ignore */
  }
}

export function addLead(input: Omit<Lead, "id" | "createdAt" | "status">): Lead {
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
  };
  writeLeads([lead, ...readLeads()]);
  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  writeLeads(readLeads().map((lead) => (lead.id === id ? { ...lead, status } : lead)));
}

export function readSiteDocuments(): SiteDocument[] {
  if (typeof window === "undefined") return DEFAULT_DOCUMENTS;
  const documents = safeParse<SiteDocument[]>(
    localStorage.getItem(DOCUMENTS_STORAGE_KEY),
    DEFAULT_DOCUMENTS,
  );
  return Array.isArray(documents) ? documents : DEFAULT_DOCUMENTS;
}

export function writeSiteDocuments(documents: SiteDocument[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
  } catch {
    /* ignore */
  }
}

export function readConstructionUpdates(): ConstructionUpdate[] {
  if (typeof window === "undefined") return DEFAULT_CONSTRUCTION_UPDATES;
  const updates = safeParse<ConstructionUpdate[]>(
    localStorage.getItem(CONSTRUCTION_STORAGE_KEY),
    DEFAULT_CONSTRUCTION_UPDATES,
  );
  return Array.isArray(updates) ? updates : DEFAULT_CONSTRUCTION_UPDATES;
}

export function writeConstructionUpdates(updates: ConstructionUpdate[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSTRUCTION_STORAGE_KEY, JSON.stringify(updates));
  } catch {
    /* ignore */
  }
}

export function readSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  const settings = safeParse<Partial<SiteSettings>>(localStorage.getItem(SETTINGS_STORAGE_KEY), {});
  return { ...DEFAULT_SITE_SETTINGS, ...settings };
}

export function writeSiteSettings(settings: SiteSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function resetAdminContent() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CONTACTS_STORAGE_KEY);
    localStorage.removeItem(LEADS_STORAGE_KEY);
    localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
    localStorage.removeItem(CONSTRUCTION_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
