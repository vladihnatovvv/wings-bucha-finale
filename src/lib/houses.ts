import { siteAsset } from "@/lib/assets";

const duplex = siteAsset("images/type-duplex-640.webp");
const duplexLarge = siteAsset("images/type-duplex-960.webp");
const townhouse = siteAsset("images/type-townhouse-640.webp");
const townhouseLarge = siteAsset("images/type-townhouse-960.webp");
const cottage = siteAsset("images/type-cottage-640.webp");
const cottageLarge = siteAsset("images/type-cottage-960.webp");
const townhouseOne = siteAsset("images/type-townhouse-one-640.webp");
const townhouseOneLarge = siteAsset("images/type-townhouse-one-960.webp");
const cityhouse = siteAsset("images/type-cityhouse-640.webp");
const cityhouseLarge = siteAsset("images/type-cityhouse-960.webp");
const hero = siteAsset("images/hero-house-640.webp");
const heroLarge = siteAsset("images/hero-house-1120.webp");

const duplexVideo = siteAsset("videos/type-duplex.mp4");
const townhouseVideo = siteAsset("videos/type-townhouse-two.mp4");
const townhouseOneVideo = siteAsset("videos/type-townhouse-one.mp4");
const cottageVideo = siteAsset("videos/type-house.mp4");
const cityhouseVideo = siteAsset("videos/type-cityhouse.mp4");

export type UnitStatus = "available" | "reserved" | "sold";

export type UnitPlan = {
  label: string;
  area: number;
  rooms: number;
  img: string;
  status?: UnitStatus;
};

export type House = {
  id: string;
  name: string;
  type: string;
  img: string;
  facade: string;
  videoUrl: string;
  area: number;
  beds: number;
  baths: number;
  floors: number;
  plot: number;
  priceUsd: number;
  priceUah?: number;
  priceCurrency?: PriceCurrency;
  available: number;
  features: string[];
  floorPlans: { label: string; img: string }[];
  unitPlans: UnitPlan[];
};

export type PriceCurrency = "USD" | "UAH";

export type HouseType = {
  id: string;
  label: string;
  pluralLabel: string;
};

export const DEFAULT_HOUSE_TYPES: HouseType[] = [
  { id: "cityhouse", label: "Сітіхаус", pluralLabel: "Сітіхауси" },
  {
    id: "townhouse-one-floor",
    label: "Таунхаус одноповерховий",
    pluralLabel: "Таунхауси одноповерхові",
  },
  {
    id: "townhouse-two-floor",
    label: "Таунхаус двоповерховий",
    pluralLabel: "Таунхауси двоповерхові",
  },
  { id: "duplex", label: "Дуплекс", pluralLabel: "Дуплекси" },
  { id: "house", label: "Будинок", pluralLabel: "Будинки" },
];

const CUSTOM_HOUSES_STORAGE_KEY = "wb_custom_houses";
const HOUSE_TYPES_STORAGE_KEY = "wb_house_types";

// Plans that were not uploaded yet use two static placeholder drawings from /public/images,
// so no SVG markup is stored in the database or sent with every houses request.
const PLAN_FLOOR_PLACEHOLDER = siteAsset("images/plan-floor-placeholder.svg");
const PLAN_UNIT_PLACEHOLDER = siteAsset("images/plan-unit-placeholder.svg");
const planFloor = (_title?: string) => PLAN_FLOOR_PLACEHOLDER;
const planUnit = (_title?: string) => PLAN_UNIT_PLACEHOLDER;

export const DEFAULT_HOUSES: House[] = [
  {
    id: "duplex",
    name: "Дуплекс «Сосна»",
    type: "duplex",
    img: duplex,
    facade: duplexLarge,
    videoUrl: duplexVideo,
    area: 128,
    beds: 3,
    baths: 2,
    floors: 2,
    plot: 3,
    priceUsd: 145000,
    available: 8,
    features: ["Тераса 18 м²", "Гараж", "Газове опалення", "Панорамні вікна"],
    floorPlans: [
      { label: "Перший поверх", img: planFloor("Перший поверх · 64 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 64 м²") },
    ],
    unitPlans: [
      {
        label: "Секція A",
        area: 128,
        rooms: 4,
        img: planUnit("Секція A · 128 м²"),
        status: "available",
      },
      {
        label: "Секція B",
        area: 128,
        rooms: 4,
        img: planUnit("Секція B · 128 м²"),
        status: "reserved",
      },
    ],
  },
  {
    id: "townhouse",
    name: "Таунхаус двоповерховий «Криве»",
    type: "townhouse-two-floor",
    img: townhouse,
    facade: townhouseLarge,
    videoUrl: townhouseVideo,
    area: 96,
    beds: 2,
    baths: 2,
    floors: 2,
    plot: 1.5,
    priceUsd: 112000,
    available: 12,
    features: ["Внутрішній дворик", "Місце під авто", "Газове опалення", "Тепла підлога"],
    floorPlans: [
      { label: "Перший поверх", img: planFloor("Перший поверх · 48 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 48 м²") },
    ],
    unitPlans: [
      { label: "Тип 1", area: 96, rooms: 3, img: planUnit("Тип 1 · 96 м²"), status: "available" },
      { label: "Тип 2", area: 102, rooms: 3, img: planUnit("Тип 2 · 102 м²"), status: "sold" },
    ],
  },
  {
    id: "cottage",
    name: "Будинок «Політ»",
    type: "house",
    img: cottage,
    facade: cottageLarge,
    videoUrl: cottageVideo,
    area: 165,
    beds: 4,
    baths: 3,
    floors: 2,
    plot: 6,
    priceUsd: 189000,
    available: 5,
    features: ["Власна ділянка 6 соток", "Камін", "Гараж на 2 авто", "Сауна-зона"],
    floorPlans: [
      { label: "Перший поверх", img: planFloor("Перший поверх · 95 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 70 м²") },
    ],
    unitPlans: [
      {
        label: "Класична",
        area: 165,
        rooms: 5,
        img: planUnit("Класична · 165 м²"),
        status: "available",
      },
      {
        label: "Розширена",
        area: 184,
        rooms: 6,
        img: planUnit("Розширена · 184 м²"),
        status: "reserved",
      },
    ],
  },
  {
    id: "duplex-pine",
    name: "Дуплекс «Криничний»",
    type: "duplex",
    img: duplex,
    facade: duplexLarge,
    videoUrl: duplexVideo,
    area: 142,
    beds: 3,
    baths: 2,
    floors: 2,
    plot: 3.5,
    priceUsd: 159000,
    available: 6,
    features: ["Тераса 22 м²", "Камін", "Гардеробна", "Підлогове опалення"],
    floorPlans: [
      { label: "Перший поверх", img: planFloor("Перший поверх · 72 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 70 м²") },
    ],
    unitPlans: [
      {
        label: "Секція A",
        area: 142,
        rooms: 4,
        img: planUnit("Секція A · 142 м²"),
        status: "available",
      },
      {
        label: "Секція B",
        area: 148,
        rooms: 4,
        img: planUnit("Секція B · 148 м²"),
        status: "available",
      },
    ],
  },
  {
    id: "townhouse-park",
    name: "Таунхаус одноповерховий «Паркова»",
    type: "townhouse-one-floor",
    img: townhouseOne,
    facade: townhouseOneLarge,
    area: 108,
    beds: 3,
    baths: 2,
    floors: 1,
    plot: 2,
    priceUsd: 124000,
    available: 9,
    videoUrl: townhouseOneVideo,
    features: ["Приватний дворик", "Гараж", "Панорамне скління", "Smart-Home Ready"],
    floorPlans: [
      { label: "Цокольний", img: planFloor("Цоколь · 30 м²") },
      { label: "Перший поверх", img: planFloor("Перший поверх · 40 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 38 м²") },
    ],
    unitPlans: [
      {
        label: "Стандарт",
        area: 108,
        rooms: 3,
        img: planUnit("Стандарт · 108 м²"),
        status: "available",
      },
      {
        label: "Кутова",
        area: 118,
        rooms: 4,
        img: planUnit("Кутова · 118 м²"),
        status: "reserved",
      },
    ],
  },
  {
    id: "cottage-forest",
    name: "Будинок «Лісовий»",
    type: "house",
    img: cottage,
    facade: cottageLarge,
    videoUrl: cottageVideo,
    area: 198,
    beds: 5,
    baths: 3,
    floors: 2,
    plot: 8,
    priceUsd: 224000,
    available: 3,
    features: ["Ділянка 8 соток", "Басейн-зона", "Камін", "Гостьовий будиночок"],
    floorPlans: [
      { label: "Перший поверх", img: planFloor("Перший поверх · 110 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 88 м²") },
    ],
    unitPlans: [
      {
        label: "Класична",
        area: 198,
        rooms: 6,
        img: planUnit("Класична · 198 м²"),
        status: "available",
      },
      { label: "Преміум", area: 220, rooms: 7, img: planUnit("Преміум · 220 м²"), status: "sold" },
    ],
  },
  {
    id: "cityhouse-forest",
    name: "Сітіхаус «Лісова 26»",
    type: "cityhouse",
    img: cityhouse,
    facade: cityhouseLarge,
    videoUrl: cityhouseVideo,
    area: 82,
    beds: 2,
    baths: 2,
    floors: 2,
    plot: 1,
    priceUsd: 98000,
    available: 7,
    features: ["Компактний формат", "Власний вхід", "Паркомісце", "Тераса"],
    floorPlans: [
      { label: "Перший поверх", img: planFloor("Перший поверх · 41 м²") },
      { label: "Другий поверх", img: planFloor("Другий поверх · 41 м²") },
    ],
    unitPlans: [
      {
        label: "Сітіхаус A",
        area: 82,
        rooms: 3,
        img: planUnit("Сітіхаус A · 82 м²"),
        status: "available",
      },
      {
        label: "Сітіхаус B",
        area: 88,
        rooms: 3,
        img: planUnit("Сітіхаус B · 88 м²"),
        status: "reserved",
      },
    ],
  },
];

type HouseEditableFields = Pick<
  House,
  | "name"
  | "type"
  | "img"
  | "facade"
  | "videoUrl"
  | "area"
  | "beds"
  | "baths"
  | "floors"
  | "plot"
  | "priceUsd"
  | "priceUah"
  | "priceCurrency"
  | "available"
  | "features"
  | "floorPlans"
  | "unitPlans"
>;

export type HouseOverride = Partial<HouseEditableFields>;

export const HOUSE_OVERRIDES_STORAGE_KEY = "wb_house_overrides";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  const translit: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "iu",
    я: "ia",
  };
  return (
    value
      .trim()
      .toLowerCase()
      .split("")
      .map((char) => translit[char] ?? char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "type"
  );
}

function uniqueId(base: string, existing: string[]) {
  let candidate = base;
  let i = 2;
  while (existing.includes(candidate)) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

export function imageForType(type: string) {
  if (type === "cityhouse") return cityhouse;
  if (type === "townhouse-one-floor") return townhouseOne;
  if (type === "townhouse-two-floor" || type === "townhouse") return townhouse;
  if (type === "cottage" || type === "house") return cottage;
  if (type === "duplex") return duplex;
  return hero;
}

export function facadeForType(type: string) {
  if (type === "cityhouse") return cityhouseLarge;
  if (type === "townhouse-one-floor") return townhouseOneLarge;
  if (type === "townhouse-two-floor" || type === "townhouse") return townhouseLarge;
  if (type === "cottage" || type === "house") return cottageLarge;
  if (type === "duplex") return duplexLarge;
  return heroLarge;
}

export function videoForType(type: string) {
  if (type === "cityhouse") return cityhouseVideo;
  if (type === "townhouse-one-floor") return townhouseOneVideo;
  if (type === "townhouse-two-floor" || type === "townhouse") return townhouseVideo;
  if (type === "cottage" || type === "house") return cottageVideo;
  if (type === "duplex") return duplexVideo;
  return "";
}

const PLACEHOLDER_IMAGE_RE =
  /^\/images\/(type-(duplex|townhouse|townhouse-one|cottage|cityhouse)|hero-house)-\d+\.webp$/;

export function isPlaceholderImage(value: string) {
  if (!value) return true;
  const path = value.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+/, "");
  return PLACEHOLDER_IMAGE_RE.test(`/${path}`);
}

export function readHouseTypes(): HouseType[] {
  if (typeof window === "undefined") return DEFAULT_HOUSE_TYPES;
  const customTypes = safeParse<HouseType[]>(localStorage.getItem(HOUSE_TYPES_STORAGE_KEY), []);
  const merged = [...DEFAULT_HOUSE_TYPES];
  for (const type of customTypes) {
    if (type?.id && type?.label && !merged.some((item) => item.id === type.id)) {
      merged.push(type);
    }
  }
  return merged;
}

export function writeCustomHouseTypes(types: HouseType[]) {
  if (typeof window === "undefined") return;
  const defaultIds = new Set(DEFAULT_HOUSE_TYPES.map((type) => type.id));
  const customTypes = types.filter((type) => !defaultIds.has(type.id));
  try {
    localStorage.setItem(HOUSE_TYPES_STORAGE_KEY, JSON.stringify(customTypes));
  } catch {
    /* ignore */
  }
}

export function addHouseType(label: string): HouseType {
  const existing = readHouseTypes();
  const id = uniqueId(
    slugify(label),
    existing.map((type) => type.id),
  );
  const type: HouseType = {
    id,
    label: label.trim(),
    pluralLabel: label.trim(),
  };
  writeCustomHouseTypes([...existing, type]);
  return type;
}

export function removeHouseType(id: string) {
  writeCustomHouseTypes(readHouseTypes().filter((type) => type.id !== id));
}

export function getHouseTypeLabel(typeId: string) {
  return readHouseTypes().find((type) => type.id === typeId)?.label ?? typeId;
}

export function getHouseTypePluralLabel(typeId: string) {
  return (
    readHouseTypes().find((type) => type.id === typeId)?.pluralLabel ?? getHouseTypeLabel(typeId)
  );
}

export function readHouseOverrides(): Record<string, HouseOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HOUSE_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeHouseOverrides(overrides: Record<string, HouseOverride>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOUSE_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    /* ignore */
  }
}

export function readCustomHouses(): House[] {
  if (typeof window === "undefined") return [];
  const houses = safeParse<House[]>(localStorage.getItem(CUSTOM_HOUSES_STORAGE_KEY), []);
  return Array.isArray(houses) ? houses : [];
}

export function writeCustomHouses(houses: House[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_HOUSES_STORAGE_KEY, JSON.stringify(houses));
  } catch {
    /* ignore */
  }
}

export function getHouses(): House[] {
  const overrides = readHouseOverrides();
  const defaultHouses = DEFAULT_HOUSES.map((house) => {
    const override = overrides[house.id];
    return override ? { ...house, ...override } : house;
  });
  return [...defaultHouses, ...readCustomHouses()];
}

export function getHouse(id: string): House | undefined {
  return getHouses().find((house) => house.id === id);
}

export function resetHouseOverrides() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HOUSE_OVERRIDES_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_HOUSES_STORAGE_KEY);
    localStorage.removeItem(HOUSE_TYPES_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function createHouse(type = "duplex"): House {
  const typeLabel = getHouseTypeLabel(type);
  const img = imageForType(type);
  const id = uniqueId(
    `house-${Date.now()}`,
    getHouses().map((house) => house.id),
  );
  return {
    id,
    name: `${typeLabel} «Новий»`,
    type,
    img,
    facade: imageForType(type),
    videoUrl: videoForType(type),
    area: 100,
    beds: 3,
    baths: 2,
    floors: 2,
    plot: 2,
    priceUsd: 100000,
    priceCurrency: "USD",
    available: 1,
    features: ["Тераса", "Місце під авто"],
    floorPlans: [{ label: "Перший поверх", img: planFloor("Перший поверх · 50 м²") }],
    unitPlans: [
      { label: "Тип 1", area: 100, rooms: 3, img: planUnit("Тип 1 · 100 м²"), status: "available" },
    ],
  };
}

export const HOUSES: House[] = DEFAULT_HOUSES;

export const PRICE_UAH_RATE = 41;

export const fmtUsd = (n: number) => "$" + new Intl.NumberFormat("uk-UA").format(n);
export const fmtUah = (usd: number) =>
  new Intl.NumberFormat("uk-UA").format(Math.round(usd * PRICE_UAH_RATE)) + " ₴";
export const fmtUahAmount = (uah: number) =>
  new Intl.NumberFormat("uk-UA").format(Math.round(uah)) + " ₴";

export function getHousePriceUah(house: House) {
  return house.priceUah ?? Math.round(house.priceUsd * PRICE_UAH_RATE);
}

export function fmtHousePrice(house: House) {
  return house.priceCurrency === "UAH"
    ? fmtUahAmount(getHousePriceUah(house))
    : fmtUsd(house.priceUsd);
}

export function fmtHouseSecondaryPrice(house: House) {
  if (house.priceCurrency === "UAH") {
    return `≈ ${fmtUsd(Math.round(getHousePriceUah(house) / PRICE_UAH_RATE))}`;
  }
  return `≈ ${fmtUah(house.priceUsd)}`;
}

export function getUnitStatusLabel(status: UnitStatus | undefined) {
  const normalized = status ?? "available";
  return {
    available: "Вільно",
    reserved: "Резерв",
    sold: "Продано",
  }[normalized];
}

export const COMPARE_STORAGE_KEY = "wb_compare_ids";

export function readCompare(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeCompare(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}
