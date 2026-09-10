import duplex from "@/assets/type-duplex.jpg";
import townhouse from "@/assets/type-townhouse.jpg";
import cottage from "@/assets/type-cottage.jpg";
import hero from "@/assets/hero-house.jpg";

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
  { id: "duplex", label: "Дуплекс", pluralLabel: "Дуплекси" },
  { id: "townhouse", label: "Таунхаус", pluralLabel: "Таунхауси" },
  { id: "cottage", label: "Котедж", pluralLabel: "Котеджі" },
];

const CUSTOM_HOUSES_STORAGE_KEY = "wb_custom_houses";
const HOUSE_TYPES_STORAGE_KEY = "wb_house_types";

// Inline SVG floor-plan placeholders (data URIs) so we don't need new image files.
const planFloor = (title: string, color = "#2f6e3a") =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 560'>
      <rect width='800' height='560' fill='#f5f3ec'/>
      <g fill='none' stroke='${color}' stroke-width='4'>
        <rect x='60' y='60' width='680' height='440'/>
        <line x1='60' y1='280' x2='740' y2='280'/>
        <line x1='380' y1='60' x2='380' y2='500'/>
        <line x1='60' y1='180' x2='220' y2='180'/>
        <line x1='220' y1='60' x2='220' y2='180'/>
        <line x1='540' y1='280' x2='540' y2='500'/>
        <line x1='540' y1='400' x2='740' y2='400'/>
        <rect x='100' y='100' width='90' height='60' fill='${color}' opacity='0.08'/>
        <rect x='260' y='100' width='100' height='150' fill='${color}' opacity='0.08'/>
        <rect x='420' y='100' width='280' height='150' fill='${color}' opacity='0.08'/>
        <rect x='100' y='320' width='240' height='150' fill='${color}' opacity='0.08'/>
        <rect x='420' y='320' width='100' height='150' fill='${color}' opacity='0.08'/>
        <rect x='560' y='320' width='160' height='60' fill='${color}' opacity='0.08'/>
      </g>
      <text x='60' y='40' font-family='Inter,sans-serif' font-size='18' fill='${color}' font-weight='600'>${title}</text>
      <text x='110' y='140' font-family='Inter,sans-serif' font-size='12' fill='#555'>Хол</text>
      <text x='280' y='180' font-family='Inter,sans-serif' font-size='12' fill='#555'>Кухня</text>
      <text x='520' y='180' font-family='Inter,sans-serif' font-size='12' fill='#555'>Вітальня</text>
      <text x='180' y='400' font-family='Inter,sans-serif' font-size='12' fill='#555'>Спальня</text>
      <text x='450' y='400' font-family='Inter,sans-serif' font-size='12' fill='#555'>С/в</text>
      <text x='600' y='360' font-family='Inter,sans-serif' font-size='12' fill='#555'>Гардероб</text>
    </svg>`,
  );

const planUnit = (title: string, color = "#2f6e3a") =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 560'>
      <rect width='800' height='560' fill='#fbfaf6'/>
      <g fill='none' stroke='${color}' stroke-width='4'>
        <rect x='80' y='80' width='640' height='400'/>
        <line x1='400' y1='80' x2='400' y2='480'/>
        <line x1='80' y1='260' x2='400' y2='260'/>
        <line x1='560' y1='80' x2='560' y2='480'/>
        <rect x='110' y='110' width='260' height='120' fill='${color}' opacity='0.08'/>
        <rect x='110' y='290' width='260' height='160' fill='${color}' opacity='0.08'/>
        <rect x='430' y='110' width='110' height='340' fill='${color}' opacity='0.08'/>
        <rect x='590' y='110' width='110' height='160' fill='${color}' opacity='0.08'/>
        <rect x='590' y='300' width='110' height='150' fill='${color}' opacity='0.08'/>
      </g>
      <text x='80' y='60' font-family='Inter,sans-serif' font-size='18' fill='${color}' font-weight='600'>${title}</text>
      <text x='180' y='180' font-family='Inter,sans-serif' font-size='12' fill='#555'>Кухня-вітальня</text>
      <text x='190' y='380' font-family='Inter,sans-serif' font-size='12' fill='#555'>Спальня</text>
      <text x='450' y='280' font-family='Inter,sans-serif' font-size='12' fill='#555'>С/в</text>
      <text x='610' y='200' font-family='Inter,sans-serif' font-size='12' fill='#555'>Спальня</text>
      <text x='610' y='390' font-family='Inter,sans-serif' font-size='12' fill='#555'>Гардероб</text>
    </svg>`,
  );

export const DEFAULT_HOUSES: House[] = [
  {
    id: "duplex",
    name: "Дуплекс «Сосна»",
    type: "duplex",
    img: duplex,
    facade: duplex,
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
    name: "Таунхаус «Криве»",
    type: "townhouse",
    img: townhouse,
    facade: townhouse,
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
    name: "Котедж «Політ»",
    type: "cottage",
    img: cottage,
    facade: cottage,
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
    img: hero,
    facade: hero,
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
    name: "Таунхаус «Паркова»",
    type: "townhouse",
    img: townhouse,
    facade: townhouse,
    area: 108,
    beds: 3,
    baths: 2,
    floors: 3,
    plot: 2,
    priceUsd: 124000,
    available: 9,
    features: ["Дах-тераса", "Гараж", "Panoramic glazing", "Smart-Home Ready"],
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
    name: "Котедж «Лісовий»",
    type: "cottage",
    img: cottage,
    facade: cottage,
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
];

type HouseEditableFields = Pick<
  House,
  | "name"
  | "type"
  | "img"
  | "facade"
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

function imageForType(type: string) {
  if (type === "townhouse") return townhouse;
  if (type === "cottage") return cottage;
  if (type === "duplex") return duplex;
  return hero;
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
    facade: img,
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
