import { siteAsset } from "@/lib/assets";

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
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
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

export type AboutFeatureItem = {
  title: string;
  text: string;
  icon: string;
};

export type FinancingProgramItem = {
  tag: string;
  rate: string;
  title: string;
  text: string;
};

export type LocationPointItem = {
  time: string;
  text: string;
};

export type HeroStatItem = {
  value: string;
  label: string;
};

/**
 * Text fields support *emphasis*: the part between asterisks is highlighted.
 * An empty text field hides that element on the site.
 */
export type HeroSection = {
  topLeft: string;
  topStatus: string;
  topDate: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  stats: HeroStatItem[];
  /** Replaces the hero photo when set. */
  image: string;
  availableLabel: string;
  availableUnit: string;
  progressTotal: number;
  progressFilled: number;
  progressCaption: string;
  priceLabel: string;
  priceFrom: string;
  creditLabel: string;
  creditBadge: string;
};

export type FooterSection = {
  about: string;
  developerTitle: string;
  developerName: string;
  copyright: string;
  tagline: string;
};

export type SiteSections = {
  hero: HeroSection;
  footer: FooterSection;
  marquee: string[];
  about: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    items: AboutFeatureItem[];
  };
  masterplan: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    points: string[];
  };
  financing: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    programs: FinancingProgramItem[];
  };
  location: {
    eyebrow: string;
    title: string;
    description: string;
    mapUrl: string;
    points: LocationPointItem[];
  };
  contactCta: {
    badge: string;
    title: string;
    description: string;
    image: string;
  };
};

export type SiteSettings = {
  scrollMediaVideoUrl: string;
  /** Play the second-section video with sound (browser may require a first click). */
  scrollMediaSound: boolean;
  /** Preview image shown before the video loads. Empty means the default image. */
  heroPosterUrl: string;
  scrollPosterUrl: string;
  /** Site logo (header, footer), browser tab icon and link-preview image. Empty = built-in. */
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  /** Video for the main hero screen. Empty means the hero photo is shown. */
  heroVideoUrl: string;
  sections?: SiteSections;
};

// Contacts are filled in by the owner in the admin panel. An empty value is simply not shown.
export const DEFAULT_CONTACTS: SiteContacts = {
  phoneDisplay: "",
  phoneHref: "",
  email: "",
  telegramUrl: "",
  whatsappUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  address: "",
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
    image: siteAsset("images/construction-foundation-800.webp"),
    progress: 35,
    sortOrder: 10,
  },
  {
    id: "phase-walls",
    date: "2026-06-18",
    title: "Моноліт і стіни",
    description: "Виконується зведення несучих конструкцій і зовнішніх стін.",
    image: siteAsset("images/construction-walls-800.webp"),
    progress: 52,
    sortOrder: 20,
  },
  {
    id: "phase-utilities",
    date: "2026-07-22",
    title: "Інженерні мережі",
    description: "Підготовлено траси під газ, електрику, воду та каналізацію.",
    image: siteAsset("images/construction-utilities-800.webp"),
    progress: 64,
    sortOrder: 30,
  },
];

export const DEFAULT_SITE_SECTIONS: SiteSections = {
  hero: {
    topLeft: "Котеджне містечко — Буча · Лісова 28",
    topStatus: "Старт продажів · І черга",
    topDate: "",
    eyebrow: "Преміальний еко-квартал",
    title: "Дім серед *сосен,*\nполіт *без меж.*",
    description:
      "Камерний квартал на 7 гектарах сосен у Бучі. Архітектура з природного каменю та дерева, повна газифікація, закрита територія. Кредит за *єОселя 3%*.",
    primaryButton: "Обрати резиденцію",
    secondaryButton: "Запросити приватний показ",
    stats: [
      { value: "єОселя", label: "акредитований забудовник" },
      { value: "15 хв", label: "до центру Києва" },
      { value: "7 га", label: "соснового лісу" },
    ],
    image: "",
    availableLabel: "Доступно у І черзі",
    availableUnit: "резиденцій",
    progressTotal: 0,
    progressFilled: 0,
    progressCaption: "",
    priceLabel: "Стартова ціна",
    priceFrom: "від",
    creditLabel: "Кредит від",
    creditBadge: "3% єОселя",
  },
  footer: {
    about:
      "Сучасне котеджне містечко серед лісу, у 15 хвилинах від Києва. Дім, де народжуються крила.",
    developerTitle: "Забудовник",
    developerName: "ТОВ «Крила Бучі Девелопмент»",
    copyright: "Wings Bucha. Усі права захищені.",
    tagline: "Світла, мінімалістична та природна архітектура",
  },
  marquee: [
    "Преміальне котеджне містечко",
    "єОселя 3% / 7%",
    "Сосновий ліс",
    "15 хв до Києва",
    "Повна газифікація",
    "Закрита територія",
    "Державні сертифікати",
  ],
  about: {
    eyebrow: "Про містечко",
    title: "Жити серед природи,\nзалишаючись поруч з містом",
    description:
      "Wings Bucha поєднує сучасну архітектуру, природне оточення та продумане планування для сімейного життя. Кожен дім — це простір для родини, де хочеться повертатись.",
    image: siteAsset("images/about-wide-800.webp"),
    items: [
      {
        title: "Серед природи",
        text: "Сосновий ліс довкола, тиша та свіже повітря щодня.",
        icon: "TreePine",
      },
      {
        title: "Повна газифікація",
        text: "Магістральний газ — економія та надійність опалення.",
        icon: "Flame",
      },
      {
        title: "15 хвилин до Києва",
        text: "Зручний виїзд, поруч траси та громадський транспорт.",
        icon: "MapPin",
      },
      {
        title: "Надійний забудовник",
        text: "Всі дозволи в наявності, прозора документація.",
        icon: "ShieldCheck",
      },
    ],
  },
  masterplan: {
    eyebrow: "Генплан",
    title: "Територія Wings Bucha",
    description:
      "7+ гектарів продуманого простору: пішохідні алеї, дитячі майданчики, зелені дворики без авто, власна інфраструктура та цілодобова охорона.",
    image: siteAsset("images/masterplan-800.webp"),
    points: [
      "Закрита територія з охороною",
      "Дитячі та спортивні майданчики",
      "Двори без авто",
      "Гостьовий паркінг",
    ],
  },
  financing: {
    eyebrow: "Умови придбання",
    title: "Кредит за єОселя та державні сертифікати",
    description:
      "Wings Bucha акредитовано у програмах державної підтримки. Допомагаємо з оформленням документів та супроводжуємо угоду до ключів.",
    image: siteAsset("images/financing-720.webp"),
    programs: [
      {
        tag: "єОселя",
        rate: "3% / 7%",
        title: "Державна іпотека єОселя",
        text: "Ставка 3% для військових, медиків, освітян та ВПО. 7% для решти категорій. Перший внесок від 20%.",
      },
      {
        tag: "Ощадбанк",
        rate: "від 9%",
        title: "Кредит від Ощадбанку",
        text: "Партнерська іпотечна програма. Швидке рішення, термін до 20 років, мінімальний пакет документів.",
      },
      {
        tag: "Сертифікат",
        rate: "100%",
        title: "Житловий сертифікат",
        text: "Приймаємо державні житлові сертифікати, отримані за пошкоджене або знищене житло.",
      },
      {
        tag: "Ваучер",
        rate: "100%",
        title: "Житловий ваучер",
        text: "Зараховуємо суму ваучера за Постановою 1176 у вартість житла. Допомагаємо з оформленням та супроводом.",
      },
      {
        tag: "Розтермінування",
        rate: "0%",
        title: "Безвідсоткове розтермінування",
        text: "До 24 місяців без переплат від забудовника. Перший внесок від 30%.",
      },
    ],
  },
  location: {
    eyebrow: "Локація",
    title: "м. Буча,\nвул. Лісова, 28",
    description:
      "15 хвилин до Києва, поруч траса Київ–Ковель. Розвинена інфраструктура: садочки, школи, супермаркети, аптеки.",
    mapUrl:
      "https://maps.google.com/maps?q=Bucha%2C%20Lisova%20St&t=&z=13&ie=UTF8&iwloc=&output=embed",
    points: [
      { time: "3 хв", text: "до садочка та школи" },
      { time: "5 хв", text: "до супермаркету" },
      { time: "8 хв", text: "до залізничної станції" },
      { time: "15 хв", text: "до Києва" },
    ],
  },
  contactCta: {
    badge: "Записатись",
    title: "Розправ крила\nвдома",
    description:
      "Залиште контакт — менеджер зателефонує впродовж 15 хвилин у робочий час, розрахує умови та запросить на огляд котеджного містечка.",
    image: siteAsset("images/contact-720.webp"),
  },
};

export function mergeSections(
  defaults: SiteSections,
  saved?: Partial<SiteSections> | null,
): SiteSections {
  if (!saved) return defaults;
  return {
    hero: {
      ...defaults.hero,
      ...(saved.hero || {}),
      // An empty list is a valid choice (hides the statistics), so only a missing one falls back.
      stats: Array.isArray(saved.hero?.stats) ? saved.hero.stats : defaults.hero.stats,
    },
    footer: {
      ...defaults.footer,
      ...(saved.footer || {}),
    },
    marquee:
      Array.isArray(saved.marquee) && saved.marquee.length > 0 ? saved.marquee : defaults.marquee,
    about: {
      ...defaults.about,
      ...(saved.about || {}),
      items:
        Array.isArray(saved.about?.items) && saved.about.items.length > 0
          ? saved.about.items
          : defaults.about.items,
    },
    masterplan: {
      ...defaults.masterplan,
      ...(saved.masterplan || {}),
      points:
        Array.isArray(saved.masterplan?.points) && saved.masterplan.points.length > 0
          ? saved.masterplan.points
          : defaults.masterplan.points,
    },
    financing: {
      ...defaults.financing,
      ...(saved.financing || {}),
      programs:
        Array.isArray(saved.financing?.programs) && saved.financing.programs.length > 0
          ? saved.financing.programs
          : defaults.financing.programs,
    },
    location: {
      ...defaults.location,
      ...(saved.location || {}),
      points:
        Array.isArray(saved.location?.points) && saved.location.points.length > 0
          ? saved.location.points
          : defaults.location.points,
    },
    contactCta: {
      ...defaults.contactCta,
      ...(saved.contactCta || {}),
    },
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  scrollMediaVideoUrl: siteAsset("videos/hero-web.mp4"),
  scrollMediaSound: true,
  heroPosterUrl: "",
  scrollPosterUrl: "",
  logoUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  heroVideoUrl: "",
  sections: DEFAULT_SITE_SECTIONS,
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
  return {
    scrollMediaVideoUrl: settings.scrollMediaVideoUrl ?? DEFAULT_SITE_SETTINGS.scrollMediaVideoUrl,
    scrollMediaSound: settings.scrollMediaSound ?? true,
    heroPosterUrl: settings.heroPosterUrl ?? "",
    scrollPosterUrl: settings.scrollPosterUrl ?? "",
    logoUrl: settings.logoUrl ?? "",
    faviconUrl: settings.faviconUrl ?? "",
    ogImageUrl: settings.ogImageUrl ?? "",
    heroVideoUrl: settings.heroVideoUrl ?? "",
    sections: mergeSections(DEFAULT_SITE_SECTIONS, settings.sections),
  };
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
