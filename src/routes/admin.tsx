import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  GripVertical,
  CheckCircle2,
  Clock3,
  FileText,
  HardHat,
  Home,
  ImagePlus,
  Layers,
  LockKeyhole,
  LogOut,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  UploadCloud,
  Users,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  DEFAULT_HOUSES,
  addHouseType,
  createHouse,
  fmtHousePrice,
  getUnitStatusLabel,
  getHouses,
  PRICE_UAH_RATE,
  readCustomHouses,
  readHouseTypes,
  removeHouseType,
  readHouseOverrides,
  resetHouseOverrides,
  writeCustomHouses,
  writeHouseOverrides,
  type House,
  type HouseType,
  type PriceCurrency,
  type UnitPlan,
  type UnitStatus,
} from "@/lib/houses";
import {
  DEFAULT_CONSTRUCTION_UPDATES,
  DEFAULT_CONTACTS,
  DEFAULT_DOCUMENTS,
  DEFAULT_SITE_SECTIONS,
  DEFAULT_SITE_SETTINGS,
  readConstructionUpdates,
  readLeads,
  readSiteDocuments,
  readSiteContacts,
  readSiteSettings,
  updateLeadStatus,
  writeConstructionUpdates,
  writeSiteDocuments,
  writeSiteContacts,
  writeSiteSettings,
  type ConstructionUpdate,
  type Lead,
  type LeadStatus,
  type SiteDocument,
  type SiteContacts,
  type SiteSections,
  type SiteSettings,
} from "@/lib/admin-store";
import {
  checkAdminAuthFn,
  deleteConstructionUpdateFn,
  deleteHouseFn,
  deleteHouseTypeFn,
  deleteSiteDocumentFn,
  listHousesFn,
  listHouseTypesFn,
  listConstructionUpdatesFn,
  listLeadsFn,
  listSiteDocumentsFn,
  loginAdminFn,
  logoutAdminFn,
  readSiteContactsFn,
  readSiteSettingsFn,
  saveConstructionUpdateFn,
  saveHouseFn,
  reorderHousesFn,
  saveHouseTypeFn,
  saveSiteDocumentFn,
  updateLeadStatusFn,
  uploadAdminFileFn,
  uploadAdminImageFn,
  writeSiteSettingsFn,
  writeSiteContactsFn,
} from "@/lib/content.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Адмінка — Wings Bucha" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

type Tab = "houses" | "sections" | "documents" | "construction" | "media" | "leads" | "contacts";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "houses", label: "Об'єкти", icon: Building2 },
  { id: "sections", label: "Секції сайту", icon: Layers },
  { id: "documents", label: "Документи", icon: FileText },
  { id: "construction", label: "Хід будівництва", icon: HardHat },
  { id: "media", label: "Медіа", icon: Video },
  { id: "leads", label: "Заявки", icon: Users },
  { id: "contacts", label: "Контакти", icon: Phone },
];

const MAX_UPLOAD_IMAGE_SIZE = 1600;
const UPLOAD_IMAGE_QUALITY = 0.82;

function bySortOrder<T extends { sortOrder: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder;
}

function AdminPage() {
  const checkAdminAuth = useServerFn(checkAdminAuthFn);
  const loginAdmin = useServerFn(loginAdminFn);
  const logoutAdmin = useServerFn(logoutAdminFn);
  const [tab, setTab] = useState<Tab>("houses");
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState({
    authenticated: false,
    configured: true,
    usesDevPassword: false,
  });
  const [checkingAuth, setCheckingAuth] = useState(true);

  const flash = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }, []);

  useEffect(() => {
    let alive = true;
    checkAdminAuth()
      .then((state) => {
        if (alive) setAuth(state);
      })
      .catch(() => {
        if (alive) flash("Не вдалося перевірити доступ до адмінки.");
      })
      .finally(() => {
        if (alive) setCheckingAuth(false);
      });
    return () => {
      alive = false;
    };
  }, [checkAdminAuth, flash]);

  async function handleLogin(password: string) {
    const state = await loginAdmin({ data: { password } });
    setAuth(state);
    flash("Вхід виконано.");
  }

  async function handleLogout() {
    await logoutAdmin();
    setAuth({
      authenticated: false,
      configured: auth.configured,
      usesDevPassword: auth.usesDevPassword,
    });
    flash("Ви вийшли з адмінки.");
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 text-foreground">
        <div className="rounded-lg border border-border bg-background px-5 py-4 text-sm font-semibold">
          Перевіряю доступ...
        </div>
      </div>
    );
  }

  if (!auth.authenticated) {
    return (
      <AdminLogin
        configured={auth.configured}
        usesDevPassword={auth.usesDevPassword}
        onLogin={handleLogin}
        onNotice={flash}
        notice={notice}
      />
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40 text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Wings Bucha
            </div>
            <h1 className="text-xl font-bold tracking-tight">Адмін-панель</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              <Home className="h-4 w-4" />
              На сайт
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Вийти
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-6">
        {notice && (
          <div className="mb-4 rounded-md border border-primary/25 bg-primary-soft px-4 py-3 text-sm font-semibold text-forest">
            {notice}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "houses" && <HousesAdmin onNotice={flash} />}
        {tab === "sections" && <SectionsAdmin onNotice={flash} />}
        {tab === "documents" && <DocumentsAdmin onNotice={flash} />}
        {tab === "construction" && <ConstructionAdmin onNotice={flash} />}
        {tab === "media" && <MediaAdmin onNotice={flash} />}
        {tab === "leads" && <LeadsAdmin onNotice={flash} />}
        {tab === "contacts" && <ContactsAdmin onNotice={flash} />}
      </main>
    </div>
  );
}

function AdminLogin({
  configured,
  usesDevPassword,
  notice,
  onLogin,
  onNotice,
}: {
  configured: boolean;
  usesDevPassword: boolean;
  notice: string;
  onLogin: (password: string) => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onLogin(password);
    } catch {
      onNotice(
        configured || usesDevPassword
          ? "Неправильний пароль."
          : "На сервері треба задати ADMIN_PASSWORD.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 text-foreground">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-card"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-forest">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Вхід в адмінку</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {usesDevPassword
            ? "Локальний демо-пароль: admin. На продакшені задайте ADMIN_PASSWORD."
            : "Введіть пароль адміністратора, заданий на сервері."}
        </p>
        {notice && (
          <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {notice}
          </div>
        )}
        <label className="mt-5 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Пароль
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            autoFocus
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <LockKeyhole className="h-4 w-4" />
          {submitting ? "Перевірка..." : "Увійти"}
        </button>
      </form>
    </div>
  );
}

function HousesAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const listHousesServer = useServerFn(listHousesFn);
  const listHouseTypesServer = useServerFn(listHouseTypesFn);
  const saveHouseServer = useServerFn(saveHouseFn);
  const deleteHouseServer = useServerFn(deleteHouseFn);
  const reorderHousesServer = useServerFn(reorderHousesFn);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const saveHouseTypeServer = useServerFn(saveHouseTypeFn);
  const deleteHouseTypeServer = useServerFn(deleteHouseTypeFn);
  const uploadAdminImageServer = useServerFn(uploadAdminImageFn);
  const uploadAdminFileServer = useServerFn(uploadAdminFileFn);
  const [houses, setHouses] = useState<House[]>(() => getHouses());
  const [houseTypes, setHouseTypes] = useState<HouseType[]>(() => readHouseTypes());
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [selectedId, setSelectedId] = useState(() => houses[0]?.id ?? "");
  const selected = houses.find((house) => house.id === selectedId) ?? houses[0];
  const [draft, setDraft] = useState<House | null>(selected ? { ...selected } : null);
  const defaultIds = useMemo(() => new Set(DEFAULT_HOUSES.map((house) => house.id)), []);

  useEffect(() => {
    let alive = true;

    Promise.all([listHousesServer(), listHouseTypesServer()])
      .then(([serverHouses, serverTypes]) => {
        if (!alive) return;
        setHouses(serverHouses);
        setHouseTypes(serverTypes);
        setSelectedId(serverHouses[0]?.id ?? "");
        setDraft(
          serverHouses[0] ? { ...serverHouses[0], features: [...serverHouses[0].features] } : null,
        );
      })
      .catch(() => {
        if (!alive) return;
        onNotice("База ще не підключена, адмінка працює в локальному демо-режимі.");
      });

    return () => {
      alive = false;
    };
  }, [listHousesServer, listHouseTypesServer, onNotice]);

  function selectHouse(house: House) {
    setSelectedId(house.id);
    setDraft({ ...house, features: [...house.features] });
  }

  async function dropHouse(targetId: string) {
    const fromId = dragId;
    setDragId(null);
    setOverId(null);
    if (!fromId || fromId === targetId) return;
    const previous = houses;
    const from = houses.findIndex((house) => house.id === fromId);
    const to = houses.findIndex((house) => house.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...houses];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setHouses(next);
    try {
      await reorderHousesServer({ data: { ids: next.map((house) => house.id) } });
      onNotice("Порядок об'єктів збережено.");
    } catch {
      setHouses(previous);
      onNotice("Не вдалося зберегти порядок. Працює лише з підключеною базою.");
    }
  }

  async function saveHouse() {
    if (!draft) return;
    try {
      const saved = await saveHouseServer({ data: draft });
      const next = await listHousesServer();
      setHouses(next);
      setSelectedId(saved.id);
      setDraft({ ...saved, features: [...saved.features] });
      onNotice("Зміни об'єкта збережено в базі.");
      return;
    } catch {
      if (defaultIds.has(draft.id)) {
        const overrides = readHouseOverrides();
        overrides[draft.id] = {
          name: draft.name,
          type: draft.type,
          img: draft.img,
          facade: draft.facade,
          videoUrl: draft.videoUrl,
          area: draft.area,
          beds: draft.beds,
          baths: draft.baths,
          floors: draft.floors,
          plot: draft.plot,
          priceUsd: draft.priceUsd,
          priceUah: draft.priceUah,
          priceCurrency: draft.priceCurrency,
          available: draft.available,
          features: draft.features,
          floorPlans: draft.floorPlans,
          unitPlans: draft.unitPlans,
        };
        writeHouseOverrides(overrides);
      } else {
        const customHouses = readCustomHouses();
        writeCustomHouses(customHouses.map((house) => (house.id === draft.id ? draft : house)));
      }
      const next = getHouses();
      setHouses(next);
      setDraft(next.find((house) => house.id === draft.id) ?? null);
      onNotice("База недоступна, зміни збережено локально.");
    }
  }

  async function addNewHouse() {
    const type = houseTypes[0]?.id ?? "duplex";
    const house = createHouse(type);
    try {
      const saved = await saveHouseServer({ data: house });
      const next = await listHousesServer();
      setHouses(next);
      setSelectedId(saved.id);
      setDraft({ ...saved, features: [...saved.features] });
      onNotice("Новий будинок додано в базу. Заповніть дані та натисніть зберегти.");
    } catch {
      writeCustomHouses([house, ...readCustomHouses()]);
      const next = getHouses();
      setHouses(next);
      setSelectedId(house.id);
      setDraft({ ...house, features: [...house.features] });
      onNotice("Новий будинок додано локально. Після підключення БД збереження піде в базу.");
    }
  }

  async function deleteHouse() {
    if (!draft) return;
    if (!window.confirm(`Видалити "${draft.name}"? Цю дію не можна скасувати.`)) return;
    try {
      await deleteHouseServer({ data: { id: draft.id } });
      const next = await listHousesServer();
      setHouses(next);
      setSelectedId(next[0]?.id ?? "");
      setDraft(next[0] ? { ...next[0], features: [...next[0].features] } : null);
      onNotice("Будинок видалено з бази.");
    } catch {
      writeCustomHouses(readCustomHouses().filter((house) => house.id !== draft.id));
      const next = getHouses();
      setHouses(next);
      setSelectedId(next[0]?.id ?? "");
      setDraft(next[0] ? { ...next[0], features: [...next[0].features] } : null);
      onNotice("Будинок видалено локально.");
    }
  }

  async function addNewType() {
    const label = newTypeLabel.trim();
    if (label.length < 2) {
      onNotice("Введіть назву нового типу.");
      return;
    }
    const type = addHouseType(label);
    try {
      await saveHouseTypeServer({ data: type });
      const nextTypes = await listHouseTypesServer();
      setHouseTypes(nextTypes);
      onNotice(`Тип "${type.label}" додано в базу.`);
    } catch {
      setHouseTypes(readHouseTypes());
      onNotice(`Тип "${type.label}" додано локально.`);
    } finally {
      setNewTypeLabel("");
      if (draft) setDraft({ ...draft, type: type.id });
    }
  }

  async function uploadImage(file: File, field: "img" | "facade") {
    if (!draft) return;
    if (!file.type.startsWith("image/")) {
      onNotice("Оберіть файл зображення.");
      return;
    }
    try {
      const optimized = await optimizeImageFile(file);
      let value = optimized;
      try {
        const formData = new FormData();
        formData.append("file", dataUrlToFile(optimized, file.name));
        const uploaded = await uploadAdminImageServer({ data: formData });
        value = uploaded.url;
      } catch {
        value = optimized;
      }
      if (!value) return;
      setDraft((current) => {
        if (!current) return current;
        if (field === "facade") return { ...current, facade: value };
        // The house page shows the facade photo, so keep it in sync unless it was set separately.
        const facadeFollows = !current.facade || current.facade === current.img;
        return { ...current, img: value, facade: facadeFollows ? value : current.facade };
      });
      onNotice("Фото додано. Натисніть зберегти, щоб закріпити зміни.");
    } catch {
      onNotice("Не вдалося прочитати фото. Спробуйте інший файл.");
    }
  }

  // Uploads a plan image (re-encoded to a compact JPEG) and returns its URL.
  async function uploadPlanImage(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      onNotice("Оберіть файл зображення.");
      return null;
    }
    try {
      const optimized = await optimizeImageFile(file);
      try {
        const formData = new FormData();
        formData.append("file", dataUrlToFile(optimized, file.name));
        const uploaded = await uploadAdminImageServer({ data: formData });
        onNotice("Планування додано. Натисніть зберегти, щоб закріпити зміни.");
        return uploaded.url;
      } catch {
        onNotice("Планування додано. Натисніть зберегти, щоб закріпити зміни.");
        return optimized;
      }
    } catch {
      onNotice("Не вдалося прочитати фото. Спробуйте інший файл.");
      return null;
    }
  }

  function updateFloorPlan(index: number, patch: Partial<House["floorPlans"][number]>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            floorPlans: current.floorPlans.map((plan, i) =>
              i === index ? { ...plan, ...patch } : plan,
            ),
          }
        : current,
    );
  }

  function addFloorPlan() {
    if (!draft) return;
    setDraft({
      ...draft,
      floorPlans: [
        ...draft.floorPlans,
        { label: `${draft.floorPlans.length + 1} поверх`, img: "" },
      ],
    });
  }

  function removeFloorPlan(index: number) {
    if (!draft || draft.floorPlans.length <= 1) return;
    setDraft({ ...draft, floorPlans: draft.floorPlans.filter((_, i) => i !== index) });
  }

  async function uploadHouseVideo(file: File) {
    if (!draft) return;
    if (!file.type.startsWith("video/")) {
      onNotice("Оберіть відеофайл.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadAdminFileServer({ data: formData });
      setDraft((current) => (current ? { ...current, videoUrl: uploaded.url } : current));
      onNotice("Відео додано. Натисніть зберегти, щоб закріпити зміни.");
    } catch {
      onNotice("Не вдалося завантажити відео. Можна вставити URL вручну.");
    }
  }

  function changePriceCurrency(priceCurrency: PriceCurrency) {
    if (!draft) return;
    const priceUah = draft.priceUah ?? Math.round(draft.priceUsd * PRICE_UAH_RATE);
    const priceUsd = draft.priceUsd || Math.round(priceUah / PRICE_UAH_RATE);
    setDraft({ ...draft, priceCurrency, priceUah, priceUsd });
  }

  function changePrice(value: number) {
    if (!draft) return;
    const currency = draft.priceCurrency ?? "USD";
    if (currency === "UAH") {
      setDraft({
        ...draft,
        priceUah: value,
        priceUsd: Math.round(value / PRICE_UAH_RATE),
      });
      return;
    }
    setDraft({
      ...draft,
      priceUsd: value,
      priceUah: Math.round(value * PRICE_UAH_RATE),
    });
  }

  function updateUnitPlan(index: number, patch: Partial<UnitPlan>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            unitPlans: current.unitPlans.map((plan, i) =>
              i === index ? { ...plan, ...patch } : plan,
            ),
          }
        : current,
    );
  }

  function addUnitPlan() {
    if (!draft) return;
    setDraft({
      ...draft,
      unitPlans: [
        ...draft.unitPlans,
        {
          label: `Планування ${draft.unitPlans.length + 1}`,
          area: draft.area,
          rooms: draft.beds + 1,
          img: draft.unitPlans[0]?.img || draft.facade,
          status: "available",
        },
      ],
    });
  }

  function removeUnitPlan(index: number) {
    if (!draft || draft.unitPlans.length <= 1) return;
    setDraft({ ...draft, unitPlans: draft.unitPlans.filter((_, i) => i !== index) });
  }

  async function deleteType(type: HouseType) {
    const usedBy = houses.filter((house) => house.type === type.id);
    if (usedBy.length > 0) {
      onNotice(
        `Тип "${type.label}" використовується в будинках (${usedBy.length}). Спочатку змініть їм тип.`,
      );
      return;
    }
    if (!window.confirm(`Видалити тип "${type.label}"?`)) return;
    const fallbackType = houseTypes.find((item) => item.id !== type.id)?.id ?? "";
    if (draft?.type === type.id) setDraft({ ...draft, type: fallbackType });
    try {
      await deleteHouseTypeServer({ data: { id: type.id } });
      setHouseTypes(await listHouseTypesServer());
      onNotice(`Тип "${type.label}" видалено.`);
    } catch {
      removeHouseType(type.id);
      setHouseTypes(readHouseTypes());
      onNotice(`Тип "${type.label}" видалено локально.`);
    }
  }

  function resetAll() {
    resetHouseOverrides();
    const next = getHouses();
    const nextTypes = readHouseTypes();
    setHouses(next);
    setHouseTypes(nextTypes);
    setNewTypeLabel("");
    setSelectedId(next[0]?.id ?? "");
    setDraft(next[0] ? { ...next[0] } : null);
    onNotice("Об'єкти повернуто до початкових значень.");
  }

  if (!draft) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-border bg-background">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Об'єкти</h2>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Скинути
            </button>
          </div>
          <button
            onClick={addNewHouse}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Новий будинок
          </button>
          <div className="mt-3 rounded-md bg-secondary/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Новий тип будинку
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newTypeLabel}
                onChange={(event) => setNewTypeLabel(event.target.value)}
                placeholder="Напр. Вілла"
                className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={addNewType}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {houses.map((house, index) => (
            <button
              key={house.id}
              draggable
              onDragStart={(event) => {
                setDragId(house.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (overId !== house.id) setOverId(house.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                void dropHouse(house.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onClick={() => selectHouse(house)}
              className={`flex w-full cursor-grab items-center gap-3 px-4 py-3 text-left transition-colors active:cursor-grabbing ${
                house.id === draft.id ? "bg-primary-soft" : "hover:bg-secondary/60"
              } ${dragId === house.id ? "opacity-40" : ""} ${
                overId === house.id && dragId && dragId !== house.id
                  ? "shadow-[inset_0_2px_0_0_var(--color-primary)]"
                  : ""
              }`}
            >
              <span className="flex w-6 shrink-0 flex-col items-center text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                <span className="text-[10px] font-semibold tabular-nums">{index + 1}</span>
              </span>
              <img src={house.img} alt="" className="h-12 w-16 rounded-md object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{house.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {houseTypes.find((type) => type.id === house.type)?.label ?? house.type} ·{" "}
                  {house.available} вільно · {fmtHousePrice(house)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-5">
        <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {houseTypes.find((type) => type.id === draft.type)?.label ?? draft.type}
            </div>
            <h2 className="text-2xl font-bold">{draft.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveHouse}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Save className="h-4 w-4" />
              Зберегти
            </button>
            <button
              onClick={deleteHouse}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-destructive hover:border-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Видалити
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Тип
            </span>
            <div className="flex min-w-0 gap-2">
              <select
                value={draft.type}
                onChange={(event) => setDraft({ ...draft, type: event.target.value })}
                className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {houseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const current = houseTypes.find((type) => type.id === draft.type);
                  if (current) void deleteType(current);
                }}
                aria-label="Видалити цей тип"
                title="Видалити обраний тип"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-destructive hover:border-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <TextField
            label="Назва"
            value={draft.name}
            onChange={(value) => setDraft({ ...draft, name: value })}
            className="md:col-span-2 xl:col-span-3"
          />
          <ImageUploadField
            label="Основне фото"
            value={draft.img}
            onChange={(value) => setDraft({ ...draft, img: value, facade: value || draft.facade })}
            onFile={(file) => uploadImage(file, "img")}
            className="md:col-span-2"
          />
          <ImageUploadField
            label="Фото фасаду"
            value={draft.facade}
            onChange={(value) => setDraft({ ...draft, facade: value })}
            onFile={(file) => uploadImage(file, "facade")}
            className="md:col-span-2"
          />
          <FileUploadField
            label="Відео об'єкта"
            value={draft.videoUrl}
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(value) => setDraft({ ...draft, videoUrl: value })}
            onFile={uploadHouseVideo}
            className="md:col-span-2 xl:col-span-4"
          />
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Валюта ціни
            </span>
            <select
              value={draft.priceCurrency ?? "USD"}
              onChange={(event) => changePriceCurrency(event.target.value as PriceCurrency)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="USD">Долари, USD</option>
              <option value="UAH">Гривні, UAH</option>
            </select>
          </label>
          <NumberField
            label={draft.priceCurrency === "UAH" ? "Ціна UAH" : "Ціна USD"}
            value={
              draft.priceCurrency === "UAH"
                ? (draft.priceUah ?? Math.round(draft.priceUsd * PRICE_UAH_RATE))
                : draft.priceUsd
            }
            onChange={changePrice}
          />
          <NumberField
            label="Вільно"
            value={draft.available}
            onChange={(value) => setDraft({ ...draft, available: value })}
          />
          <NumberField
            label="Площа, м²"
            value={draft.area}
            onChange={(value) => setDraft({ ...draft, area: value })}
          />
          <NumberField
            label="Спальні"
            value={draft.beds}
            onChange={(value) => setDraft({ ...draft, beds: value })}
          />
          <NumberField
            label="Санвузли"
            value={draft.baths}
            onChange={(value) => setDraft({ ...draft, baths: value })}
          />
          <NumberField
            label="Поверхи"
            value={draft.floors}
            onChange={(value) => setDraft({ ...draft, floors: value })}
          />
          <NumberField
            label="Ділянка, сот"
            value={draft.plot}
            onChange={(value) => setDraft({ ...draft, plot: value })}
          />
          <label className="grid gap-1.5 md:col-span-2 xl:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Особливості, кожна з нового рядка
            </span>
            <textarea
              value={draft.features.join("\n")}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  features: event.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              rows={5}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold">Планування поверхів</h3>
              <p className="text-xs text-muted-foreground">
                Зображення на вкладці «Планування поверху» на сторінці об'єкта.
              </p>
            </div>
            <button
              onClick={addFloorPlan}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Додати поверх
            </button>
          </div>
          <div className="grid gap-3">
            {draft.floorPlans.map((plan, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[1fr_auto]"
              >
                <TextField
                  label="Назва поверху"
                  value={plan.label}
                  onChange={(value) => updateFloorPlan(index, { label: value })}
                />
                <button
                  onClick={() => removeFloorPlan(index)}
                  disabled={draft.floorPlans.length <= 1}
                  className="inline-flex h-10 items-center justify-center self-end rounded-md border border-border px-3 text-destructive hover:border-destructive disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ImageUploadField
                  label={`Зображення поверху ${index + 1}`}
                  value={plan.img}
                  onChange={(value) => updateFloorPlan(index, { img: value })}
                  onFile={async (file) => {
                    const url = await uploadPlanImage(file);
                    if (url) updateFloorPlan(index, { img: url });
                  }}
                  className="md:col-span-2"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold">Планування квартир / секцій</h3>
              <p className="text-xs text-muted-foreground">
                Тут ставиться статус для конкретного планування: вільно, резерв або продано.
              </p>
            </div>
            <button
              onClick={addUnitPlan}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Додати планування
            </button>
          </div>
          <div className="grid gap-3">
            {draft.unitPlans.map((plan, index) => (
              <div
                key={`${plan.label}-${index}`}
                className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_0.8fr_auto]"
              >
                <TextField
                  label="Назва"
                  value={plan.label}
                  onChange={(value) => updateUnitPlan(index, { label: value })}
                />
                <NumberField
                  label="Площа"
                  value={plan.area}
                  onChange={(value) => updateUnitPlan(index, { area: value })}
                />
                <NumberField
                  label="Кімнати"
                  value={plan.rooms}
                  onChange={(value) => updateUnitPlan(index, { rooms: value })}
                />
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Статус
                  </span>
                  <select
                    value={plan.status ?? "available"}
                    onChange={(event) =>
                      updateUnitPlan(index, { status: event.target.value as UnitStatus })
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="available">{getUnitStatusLabel("available")}</option>
                    <option value="reserved">{getUnitStatusLabel("reserved")}</option>
                    <option value="sold">{getUnitStatusLabel("sold")}</option>
                  </select>
                </label>
                <button
                  onClick={() => removeUnitPlan(index)}
                  disabled={draft.unitPlans.length <= 1}
                  className="inline-flex h-10 items-center justify-center self-end rounded-md border border-border px-3 text-destructive hover:border-destructive disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ImageUploadField
                  label={`Зображення планування ${index + 1} (квартира/секція)`}
                  value={plan.img}
                  onChange={(value) => updateUnitPlan(index, { img: value })}
                  onFile={async (file) => {
                    const url = await uploadPlanImage(file);
                    if (url) updateUnitPlan(index, { img: url });
                  }}
                  className="md:col-span-5"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LeadsAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const listLeadsServer = useServerFn(listLeadsFn);
  const updateLeadStatusServer = useServerFn(updateLeadStatusFn);
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>(() => readLeads());

  useEffect(() => {
    let alive = true;
    listLeadsServer()
      .then((serverLeads) => {
        if (alive) setLeads(serverLeads);
      })
      .catch(() => {
        if (alive) setLeads(readLeads());
      });
    return () => {
      alive = false;
    };
  }, [listLeadsServer]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.phone, lead.email, lead.interest, lead.message]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [leads, query]);

  async function setStatus(id: string, status: LeadStatus) {
    try {
      await updateLeadStatusServer({ data: { id, status } });
      setLeads(await listLeadsServer());
      onNotice("Статус заявки оновлено в базі.");
    } catch {
      updateLeadStatus(id, status);
      setLeads(readLeads());
      onNotice("Статус заявки оновлено локально.");
    }
  }

  return (
    <section className="rounded-lg border border-border bg-background">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Заявки</h2>
          <p className="text-sm text-muted-foreground">Заявки з контактної форми.</p>
        </div>
        <label className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">Заявок поки немає.</div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((lead) => (
            <article key={lead.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{lead.name}</h3>
                  <StatusBadge status={lead.status} />
                </div>
                <div className="mt-2 grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
                  <span>{lead.phone}</span>
                  <span>{lead.email || "Email не вказано"}</span>
                  <span>{lead.interest}</span>
                  <span>{new Date(lead.createdAt).toLocaleString("uk-UA")}</span>
                </div>
                {lead.message && (
                  <p className="mt-3 rounded-md bg-secondary/70 p-3 text-sm">{lead.message}</p>
                )}
              </div>
              <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                <StatusButton
                  active={lead.status === "new"}
                  onClick={() => setStatus(lead.id, "new")}
                >
                  Нова
                </StatusButton>
                <StatusButton
                  active={lead.status === "in_progress"}
                  onClick={() => setStatus(lead.id, "in_progress")}
                >
                  В роботі
                </StatusButton>
                <StatusButton
                  active={lead.status === "done"}
                  onClick={() => setStatus(lead.id, "done")}
                >
                  Готово
                </StatusButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ContactsAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const readSiteContactsServer = useServerFn(readSiteContactsFn);
  const writeSiteContactsServer = useServerFn(writeSiteContactsFn);
  const [contacts, setContacts] = useState<SiteContacts>(() => readSiteContacts());

  useEffect(() => {
    let alive = true;
    readSiteContactsServer()
      .then((serverContacts) => {
        if (alive) setContacts(serverContacts);
      })
      .catch(() => {
        if (alive) setContacts(readSiteContacts());
      });
    return () => {
      alive = false;
    };
  }, [readSiteContactsServer]);

  async function save() {
    try {
      const saved = await writeSiteContactsServer({ data: contacts });
      setContacts(saved);
      onNotice("Контакти збережено в базі.");
    } catch {
      writeSiteContacts(contacts);
      onNotice("База недоступна, контакти збережено локально.");
    }
  }

  function reset() {
    setContacts(DEFAULT_CONTACTS);
    writeSiteContacts(DEFAULT_CONTACTS);
    onNotice("Контакти повернуто до початкових значень.");
  }

  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Контакти сайту</h2>
          <p className="text-sm text-muted-foreground">
            Ці дані використовуються в хедері, футері, контактному блоці та floating-кнопках.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            Скинути
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Save className="h-4 w-4" />
            Зберегти
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Телефон на сайті"
          value={contacts.phoneDisplay}
          onChange={(value) => setContacts({ ...contacts, phoneDisplay: value })}
        />
        <TextField
          label="Телефон для tel:"
          value={contacts.phoneHref}
          onChange={(value) => setContacts({ ...contacts, phoneHref: value })}
        />
        <TextField
          label="Email"
          value={contacts.email}
          onChange={(value) => setContacts({ ...contacts, email: value })}
        />
        <TextField
          label="Адреса"
          value={contacts.address}
          onChange={(value) => setContacts({ ...contacts, address: value })}
        />
        <TextField
          label="Telegram URL"
          value={contacts.telegramUrl}
          onChange={(value) => setContacts({ ...contacts, telegramUrl: value })}
        />
        <TextField
          label="WhatsApp URL"
          value={contacts.whatsappUrl}
          onChange={(value) => setContacts({ ...contacts, whatsappUrl: value })}
        />
        <TextField
          label="Instagram URL"
          value={contacts.instagramUrl}
          onChange={(value) => setContacts({ ...contacts, instagramUrl: value })}
        />
        <TextField
          label="Facebook URL"
          value={contacts.facebookUrl}
          onChange={(value) => setContacts({ ...contacts, facebookUrl: value })}
        />
        <TextField
          label="TikTok URL"
          value={contacts.tiktokUrl}
          onChange={(value) => setContacts({ ...contacts, tiktokUrl: value })}
        />
        <p className="text-xs text-muted-foreground md:col-span-2">
          Порожнє поле на сайті не показується: достатньо стерти значення й зберегти.
        </p>
      </div>
    </section>
  );
}

const ABOUT_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "TreePine", label: "🌲 Сосна / Ліс (TreePine)" },
  { value: "Flame", label: "🔥 Газ / Опалення (Flame)" },
  { value: "MapPin", label: "📍 Локація (MapPin)" },
  { value: "ShieldCheck", label: "🛡️ Безпека / Надійність (ShieldCheck)" },
  { value: "Sparkles", label: "✨ Преміум (Sparkles)" },
  { value: "Home", label: "🏠 Дім (Home)" },
  { value: "Building2", label: "🏢 Будівля / Таунхаус (Building2)" },
  { value: "Leaf", label: "🍃 Природа / Еко (Leaf)" },
  { value: "Wallet", label: "💳 Кредит / Фінанси (Wallet)" },
  { value: "CheckCircle2", label: "✅ Перевірено (CheckCircle2)" },
];

function SectionsAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const readSettingsServer = useServerFn(readSiteSettingsFn);
  const writeSettingsServer = useServerFn(writeSiteSettingsFn);
  const uploadImageServer = useServerFn(uploadAdminImageFn);

  const [settings, setSettings] = useState<SiteSettings>(() => readSiteSettings());
  const [sections, setSections] = useState<SiteSections>(
    () => settings.sections ?? DEFAULT_SITE_SECTIONS,
  );
  const [subTab, setSubTab] = useState<
    "hero" | "about" | "marquee" | "masterplan" | "financing" | "location" | "contactCta" | "footer"
  >("hero");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    readSettingsServer()
      .then((serverSettings) => {
        if (!alive) return;
        setSettings(serverSettings);
        setSections(serverSettings.sections ?? DEFAULT_SITE_SECTIONS);
      })
      .catch(() => {
        if (!alive) return;
        const local = readSiteSettings();
        setSettings(local);
        setSections(local.sections ?? DEFAULT_SITE_SECTIONS);
      });
    return () => {
      alive = false;
    };
  }, [readSettingsServer]);

  async function handleUpload(file: File, onDone: (url: string) => void, prefix: string) {
    try {
      const dataUrl = await optimizeImageFile(file);
      const cleanFile = dataUrlToFile(dataUrl, `${prefix}-${Date.now()}.jpg`);
      const formData = new FormData();
      formData.append("file", cleanFile);
      const res = await uploadImageServer({ data: formData });
      onDone(res.url);
      onNotice("Зображення завантажено. Не забудьте натиснути «Зберегти».");
    } catch {
      onNotice("Не вдалося завантажити зображення на сервер.");
    }
  }

  async function save() {
    setSaving(true);
    const updated: SiteSettings = {
      ...settings,
      sections,
    };
    try {
      const saved = await writeSettingsServer({ data: updated });
      setSettings(saved);
      setSections(saved.sections ?? DEFAULT_SITE_SECTIONS);
      onNotice("Зміни секцій успішно збережено в базі!");
    } catch {
      writeSiteSettings(updated);
      setSettings(updated);
      onNotice("База недоступна, зміни збережено локально.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (!window.confirm("Скинути наповнення секцій до стандартного?")) return;
    setSections(DEFAULT_SITE_SECTIONS);
    onNotice("Секції скинуто. Натисніть «Зберегти», щоб зафіксувати.");
  }

  function setHero(patch: Partial<SiteSections["hero"]>) {
    setSections((prev) => ({ ...prev, hero: { ...prev.hero, ...patch } }));
  }

  function setFooter(patch: Partial<SiteSections["footer"]>) {
    setSections((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }));
  }

  const heroStats = [0, 1, 2].map(
    (index) => sections.hero.stats[index] ?? { value: "", label: "" },
  );

  function setHeroStat(index: number, patch: Partial<{ value: string; label: string }>) {
    const next = heroStats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat));
    setHero({ stats: next });
  }

  const subTabs = [
    { id: "hero", label: "Головний екран (Hero)" },
    { id: "about", label: "Про містечко" },
    { id: "marquee", label: "Рядок переваг (Тікер)" },
    { id: "masterplan", label: "Генплан" },
    { id: "financing", label: "Умови придбання / єОселя" },
    { id: "location", label: "Локація" },
    { id: "contactCta", label: "Блок запису (CTA)" },
    { id: "footer", label: "Підвал (Footer)" },
  ] as const;

  return (
    <section className="rounded-lg border border-border bg-background p-5 shadow-card">
      <AdminSectionHeader
        title="Секції сайту"
        description="Редагування наповнення сайту: тексти, фото, списки, програми. Порожнє поле на сайті не показується."
      >
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          Скинути
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Збереження..." : "Зберегти зміни"}
        </button>
      </AdminSectionHeader>

      {/* Sub-tabs pills */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-border pb-4">
        {subTabs.map((st) => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              subTab === st.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary/50 text-foreground hover:border-primary"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* HERO */}
        {subTab === "hero" && (
          <div className="grid gap-6">
            <div className="rounded-lg border border-border/80 bg-secondary/20 p-4 text-xs text-muted-foreground">
              💡 У заголовку й описі частину тексту між зірочками буде виділено: «Дім серед
              *сосен,*». Новий рядок у заголовку починає наступний рядок. Відео для Hero додається у
              вкладці «Медіа». Кількість доступних і ціна «від» рахуються автоматично за будинками.
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                label="Верхній рядок, зліва"
                value={sections.hero.topLeft}
                onChange={(val) => setHero({ topLeft: val })}
              />
              <TextField
                label="Верхній рядок, статус"
                value={sections.hero.topStatus}
                onChange={(val) => setHero({ topStatus: val })}
              />
              <TextField
                label="Верхній рядок, дата"
                value={sections.hero.topDate}
                onChange={(val) => setHero({ topDate: val })}
              />
            </div>

            <TextField
              label="Надзаголовок"
              value={sections.hero.eyebrow}
              onChange={(val) => setHero({ eyebrow: val })}
            />
            <TextAreaField
              label="Головний заголовок"
              rows={2}
              value={sections.hero.title}
              onChange={(val) => setHero({ title: val })}
            />
            <TextAreaField
              label="Опис"
              rows={3}
              value={sections.hero.description}
              onChange={(val) => setHero({ description: val })}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Кнопка 1 (веде до будинків)"
                value={sections.hero.primaryButton}
                onChange={(val) => setHero({ primaryButton: val })}
              />
              <TextField
                label="Кнопка 2 (веде до форми)"
                value={sections.hero.secondaryButton}
                onChange={(val) => setHero({ secondaryButton: val })}
              />
            </div>

            <div className="grid gap-3">
              <h3 className="text-sm font-bold">Цифри під кнопками (до трьох)</h3>
              {heroStats.map((stat, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr]">
                  <TextField
                    label={`Цифра ${index + 1}`}
                    value={stat.value}
                    onChange={(val) => setHeroStat(index, { value: val })}
                  />
                  <TextField
                    label="Підпис"
                    value={stat.label}
                    onChange={(val) => setHeroStat(index, { label: val })}
                  />
                </div>
              ))}
            </div>

            <ImageUploadField
              label="Фото в арці (порожньо = стандартне)"
              value={sections.hero.image}
              onChange={(val) => setHero({ image: val })}
              onFile={(file) => handleUpload(file, (url) => setHero({ image: url }), "hero")}
            />

            <div className="grid gap-3 rounded-lg border border-border p-4">
              <h3 className="text-sm font-bold">Картка «Доступно»</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Назва картки (порожньо = сховати картку)"
                  value={sections.hero.availableLabel}
                  onChange={(val) => setHero({ availableLabel: val })}
                />
                <TextField
                  label="Підпис біля числа"
                  value={sections.hero.availableUnit}
                  onChange={(val) => setHero({ availableUnit: val })}
                />
                <NumberField
                  label="Крапок усього (0 = без крапок)"
                  value={sections.hero.progressTotal}
                  onChange={(val) => setHero({ progressTotal: val })}
                />
                <NumberField
                  label="З них заповнених"
                  value={sections.hero.progressFilled}
                  onChange={(val) => setHero({ progressFilled: val })}
                />
              </div>
              <TextField
                label="Підпис під крапками"
                value={sections.hero.progressCaption}
                onChange={(val) => setHero({ progressCaption: val })}
              />
            </div>

            <div className="grid gap-3 rounded-lg border border-border p-4">
              <h3 className="text-sm font-bold">Картка «Ціна»</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Назва картки (порожньо = сховати картку)"
                  value={sections.hero.priceLabel}
                  onChange={(val) => setHero({ priceLabel: val })}
                />
                <TextField
                  label="Слово справа від назви"
                  value={sections.hero.priceFrom}
                  onChange={(val) => setHero({ priceFrom: val })}
                />
                <TextField
                  label="Рядок кредиту, підпис"
                  value={sections.hero.creditLabel}
                  onChange={(val) => setHero({ creditLabel: val })}
                />
                <TextField
                  label="Рядок кредиту, значок"
                  value={sections.hero.creditBadge}
                  onChange={(val) => setHero({ creditBadge: val })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {subTab === "about" && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Надзаголовок (Eyebrow)"
                value={sections.about.eyebrow}
                onChange={(val) =>
                  setSections({ ...sections, about: { ...sections.about, eyebrow: val } })
                }
              />
              <ImageUploadField
                label="Широке фото містечка"
                value={sections.about.image}
                onChange={(val) =>
                  setSections({ ...sections, about: { ...sections.about, image: val } })
                }
                onFile={(file) =>
                  handleUpload(
                    file,
                    (url) =>
                      setSections((prev) => ({ ...prev, about: { ...prev.about, image: url } })),
                    "about",
                  )
                }
              />
            </div>
            {sections.about.image && (
              <img
                src={sections.about.image}
                alt="Про містечко"
                className="max-h-56 w-full rounded-xl border border-border object-cover"
              />
            )}
            <TextAreaField
              label="Головний заголовок"
              rows={2}
              value={sections.about.title}
              onChange={(val) =>
                setSections({ ...sections, about: { ...sections.about, title: val } })
              }
            />
            <TextAreaField
              label="Опис секції"
              rows={3}
              value={sections.about.description}
              onChange={(val) =>
                setSections({ ...sections, about: { ...sections.about, description: val } })
              }
            />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Картки переваг ({sections.about.items.length})
                </h3>
                <button
                  onClick={() =>
                    setSections({
                      ...sections,
                      about: {
                        ...sections.about,
                        items: [
                          ...sections.about.items,
                          {
                            title: "Нова перевага",
                            text: "Опис переваги містечка.",
                            icon: "TreePine",
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Додати картку
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sections.about.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Картка #{idx + 1}</span>
                      <button
                        onClick={() =>
                          setSections({
                            ...sections,
                            about: {
                              ...sections.about,
                              items: sections.about.items.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Видалити"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <TextField
                        label="Заголовок"
                        value={item.title}
                        onChange={(val) => {
                          const updated = [...sections.about.items];
                          updated[idx] = { ...updated[idx], title: val };
                          setSections({
                            ...sections,
                            about: { ...sections.about, items: updated },
                          });
                        }}
                      />
                      <TextAreaField
                        label="Текст"
                        rows={2}
                        value={item.text}
                        onChange={(val) => {
                          const updated = [...sections.about.items];
                          updated[idx] = { ...updated[idx], text: val };
                          setSections({
                            ...sections,
                            about: { ...sections.about, items: updated },
                          });
                        }}
                      />
                      <label className="grid gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Іконка
                        </span>
                        <select
                          value={item.icon || "TreePine"}
                          onChange={(e) => {
                            const updated = [...sections.about.items];
                            updated[idx] = { ...updated[idx], icon: e.target.value };
                            setSections({
                              ...sections,
                              about: { ...sections.about, items: updated },
                            });
                          }}
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                        >
                          {ABOUT_ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MARQUEE */}
        {subTab === "marquee" && (
          <div className="grid gap-6">
            <div>
              <h3 className="text-sm font-bold">Рядок переваг (Тікер)</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Текст, що безперервно рухається горизонтальною стрічкою. Кожен пункт вказується з
                нового рядка.
              </p>
            </div>
            <TextAreaField
              label="Пункти тікера (по одному на рядок)"
              rows={8}
              value={sections.marquee.join("\n")}
              onChange={(val) => {
                const list = val
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                setSections({ ...sections, marquee: list });
              }}
            />
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Попередній перегляд пунктів ({sections.marquee.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {sections.marquee.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium"
                  >
                    🍃 {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MASTERPLAN */}
        {subTab === "masterplan" && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Надзаголовок"
                value={sections.masterplan.eyebrow}
                onChange={(val) =>
                  setSections({ ...sections, masterplan: { ...sections.masterplan, eyebrow: val } })
                }
              />
              <TextField
                label="Заголовок"
                value={sections.masterplan.title}
                onChange={(val) =>
                  setSections({ ...sections, masterplan: { ...sections.masterplan, title: val } })
                }
              />
            </div>
            <TextAreaField
              label="Опис генплану"
              rows={3}
              value={sections.masterplan.description}
              onChange={(val) =>
                setSections({
                  ...sections,
                  masterplan: { ...sections.masterplan, description: val },
                })
              }
            />
            <ImageUploadField
              label="Зображення генплану (мапа території)"
              value={sections.masterplan.image}
              onChange={(val) =>
                setSections({ ...sections, masterplan: { ...sections.masterplan, image: val } })
              }
              onFile={(file) =>
                handleUpload(
                  file,
                  (url) =>
                    setSections((prev) => ({
                      ...prev,
                      masterplan: { ...prev.masterplan, image: url },
                    })),
                  "masterplan",
                )
              }
            />
            {sections.masterplan.image && (
              <img
                src={sections.masterplan.image}
                alt="Генплан"
                className="max-h-72 w-full rounded-xl border border-border object-cover"
              />
            )}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Пункти списку генплану ({sections.masterplan.points.length})
                </h3>
                <button
                  onClick={() =>
                    setSections({
                      ...sections,
                      masterplan: {
                        ...sections.masterplan,
                        points: [...sections.masterplan.points, "Новий пункт генплану"],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Додати пункт
                </button>
              </div>
              <div className="grid gap-2">
                {sections.masterplan.points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={pt}
                      onChange={(e) => {
                        const updated = [...sections.masterplan.points];
                        updated[idx] = e.target.value;
                        setSections({
                          ...sections,
                          masterplan: { ...sections.masterplan, points: updated },
                        });
                      }}
                      className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        const updated = sections.masterplan.points.filter((_, i) => i !== idx);
                        setSections({
                          ...sections,
                          masterplan: { ...sections.masterplan, points: updated },
                        });
                      }}
                      className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Видалити"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FINANCING */}
        {subTab === "financing" && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Надзаголовок"
                value={sections.financing.eyebrow}
                onChange={(val) =>
                  setSections({ ...sections, financing: { ...sections.financing, eyebrow: val } })
                }
              />
              <TextField
                label="Заголовок"
                value={sections.financing.title}
                onChange={(val) =>
                  setSections({ ...sections, financing: { ...sections.financing, title: val } })
                }
              />
            </div>
            <TextAreaField
              label="Опис умов фінансування"
              rows={3}
              value={sections.financing.description}
              onChange={(val) =>
                setSections({
                  ...sections,
                  financing: { ...sections.financing, description: val },
                })
              }
            />
            <ImageUploadField
              label="Фото блоку фінансування"
              value={sections.financing.image}
              onChange={(val) =>
                setSections({ ...sections, financing: { ...sections.financing, image: val } })
              }
              onFile={(file) =>
                handleUpload(
                  file,
                  (url) =>
                    setSections((prev) => ({
                      ...prev,
                      financing: { ...prev.financing, image: url },
                    })),
                  "financing",
                )
              }
            />
            {sections.financing.image && (
              <img
                src={sections.financing.image}
                alt="Фінансування"
                className="max-h-56 w-full rounded-xl border border-border object-cover"
              />
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Програми фінансування ({sections.financing.programs.length})
                </h3>
                <button
                  onClick={() =>
                    setSections({
                      ...sections,
                      financing: {
                        ...sections.financing,
                        programs: [
                          ...sections.financing.programs,
                          {
                            tag: "Програма",
                            rate: "0%",
                            title: "Нова програма",
                            text: "Умови придбання та процентні ставки.",
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Додати програму
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sections.financing.programs.map((prog, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Програма #{idx + 1}</span>
                      <button
                        onClick={() =>
                          setSections({
                            ...sections,
                            financing: {
                              ...sections.financing,
                              programs: sections.financing.programs.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Видалити"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <TextField
                          label="Тег (назва)"
                          value={prog.tag}
                          onChange={(val) => {
                            const updated = [...sections.financing.programs];
                            updated[idx] = { ...updated[idx], tag: val };
                            setSections({
                              ...sections,
                              financing: { ...sections.financing, programs: updated },
                            });
                          }}
                        />
                        <TextField
                          label="Ставка / Відсоток"
                          value={prog.rate}
                          onChange={(val) => {
                            const updated = [...sections.financing.programs];
                            updated[idx] = { ...updated[idx], rate: val };
                            setSections({
                              ...sections,
                              financing: { ...sections.financing, programs: updated },
                            });
                          }}
                        />
                      </div>
                      <TextField
                        label="Заголовок програми"
                        value={prog.title}
                        onChange={(val) => {
                          const updated = [...sections.financing.programs];
                          updated[idx] = { ...updated[idx], title: val };
                          setSections({
                            ...sections,
                            financing: { ...sections.financing, programs: updated },
                          });
                        }}
                      />
                      <TextAreaField
                        label="Опис умов"
                        rows={2}
                        value={prog.text}
                        onChange={(val) => {
                          const updated = [...sections.financing.programs];
                          updated[idx] = { ...updated[idx], text: val };
                          setSections({
                            ...sections,
                            financing: { ...sections.financing, programs: updated },
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOCATION */}
        {subTab === "location" && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Надзаголовок"
                value={sections.location.eyebrow}
                onChange={(val) =>
                  setSections({ ...sections, location: { ...sections.location, eyebrow: val } })
                }
              />
              <TextField
                label="Google Maps URL (embed iframe)"
                value={sections.location.mapUrl}
                onChange={(val) =>
                  setSections({ ...sections, location: { ...sections.location, mapUrl: val } })
                }
              />
            </div>
            <TextAreaField
              label="Заголовок локації"
              rows={2}
              value={sections.location.title}
              onChange={(val) =>
                setSections({ ...sections, location: { ...sections.location, title: val } })
              }
            />
            <TextAreaField
              label="Опис локації та інфраструктури"
              rows={3}
              value={sections.location.description}
              onChange={(val) =>
                setSections({ ...sections, location: { ...sections.location, description: val } })
              }
            />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Час до ключових локацій ({sections.location.points.length})
                </h3>
                <button
                  onClick={() =>
                    setSections({
                      ...sections,
                      location: {
                        ...sections.location,
                        points: [
                          ...sections.location.points,
                          { time: "5 хв", text: "до нового об'єкта" },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Додати точку
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {sections.location.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-2.5"
                  >
                    <input
                      placeholder="Час (напр. 5 хв)"
                      value={pt.time}
                      onChange={(e) => {
                        const updated = [...sections.location.points];
                        updated[idx] = { ...updated[idx], time: e.target.value };
                        setSections({
                          ...sections,
                          location: { ...sections.location, points: updated },
                        });
                      }}
                      className="h-9 w-28 rounded-md border border-input bg-background px-2.5 text-xs font-bold outline-none focus:border-primary"
                    />
                    <input
                      placeholder="Куди (напр. до супермаркету)"
                      value={pt.text}
                      onChange={(e) => {
                        const updated = [...sections.location.points];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        setSections({
                          ...sections,
                          location: { ...sections.location, points: updated },
                        });
                      }}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        const updated = sections.location.points.filter((_, i) => i !== idx);
                        setSections({
                          ...sections,
                          location: { ...sections.location, points: updated },
                        });
                      }}
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Видалити"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT CTA */}
        {subTab === "contactCta" && (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Бейдж"
                value={sections.contactCta.badge}
                onChange={(val) =>
                  setSections({
                    ...sections,
                    contactCta: { ...sections.contactCta, badge: val },
                  })
                }
              />
              <ImageUploadField
                label="Фото блоку запису на огляд"
                value={sections.contactCta.image}
                onChange={(val) =>
                  setSections({
                    ...sections,
                    contactCta: { ...sections.contactCta, image: val },
                  })
                }
                onFile={(file) =>
                  handleUpload(
                    file,
                    (url) =>
                      setSections((prev) => ({
                        ...prev,
                        contactCta: { ...prev.contactCta, image: url },
                      })),
                    "contact",
                  )
                }
              />
            </div>
            {sections.contactCta.image && (
              <img
                src={sections.contactCta.image}
                alt="Запис на огляд"
                className="max-h-56 w-full rounded-xl border border-border object-cover"
              />
            )}
            <TextAreaField
              label="Заголовок заклику до дії"
              rows={2}
              value={sections.contactCta.title}
              onChange={(val) =>
                setSections({
                  ...sections,
                  contactCta: { ...sections.contactCta, title: val },
                })
              }
            />
            <TextAreaField
              label="Опис заклику"
              rows={3}
              value={sections.contactCta.description}
              onChange={(val) =>
                setSections({
                  ...sections,
                  contactCta: { ...sections.contactCta, description: val },
                })
              }
            />
            <div className="rounded-lg border border-border/80 bg-secondary/20 p-4 text-xs text-muted-foreground">
              💡 Номери телефонів, пошта, адреса та месенджери налаштовуються у вкладці «Контакти».
            </div>
          </div>
        )}

        {/* FOOTER */}
        {subTab === "footer" && (
          <div className="grid gap-6">
            <TextAreaField
              label="Короткий опис під логотипом"
              rows={3}
              value={sections.footer.about}
              onChange={(val) => setFooter({ about: val })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Заголовок блоку з реквізитами"
                value={sections.footer.developerTitle}
                onChange={(val) => setFooter({ developerTitle: val })}
              />
              <TextField
                label="Забудовник / реквізити (порожньо = сховати блок)"
                value={sections.footer.developerName}
                onChange={(val) => setFooter({ developerName: val })}
              />
              <TextField
                label="Текст після © і року"
                value={sections.footer.copyright}
                onChange={(val) => setFooter({ copyright: val })}
              />
              <TextField
                label="Рядок справа внизу"
                value={sections.footer.tagline}
                onChange={(val) => setFooter({ tagline: val })}
              />
            </div>
            <div className="rounded-lg border border-border/80 bg-secondary/20 p-4 text-xs text-muted-foreground">
              💡 Контакти й соцмережі в підвалі беруться з вкладки «Контакти».
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DocumentsAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const listDocumentsServer = useServerFn(listSiteDocumentsFn);
  const saveDocumentServer = useServerFn(saveSiteDocumentFn);
  const deleteDocumentServer = useServerFn(deleteSiteDocumentFn);
  const uploadFileServer = useServerFn(uploadAdminFileFn);
  const [documents, setDocuments] = useState<SiteDocument[]>(() => readSiteDocuments());

  useEffect(() => {
    let alive = true;
    listDocumentsServer()
      .then((items) => {
        if (alive) setDocuments(items);
      })
      .catch(() => {
        if (alive) setDocuments(readSiteDocuments());
      });
    return () => {
      alive = false;
    };
  }, [listDocumentsServer]);

  function updateDocument(id: string, patch: Partial<SiteDocument>) {
    setDocuments((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadDocumentFile(id: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadFileServer({ data: formData });
      if (!uploaded?.url) {
        console.error("Document upload returned no url", uploaded);
        onNotice("Сервер не повернув URL файлу. Можна вставити URL вручну.");
        return;
      }
      updateDocument(id, { fileUrl: uploaded.url });
      onNotice("Файл додано. Натисніть зберегти, щоб закріпити документ.");
    } catch (error) {
      console.error("Document upload failed", error);
      const reason = error instanceof Error ? error.message : String(error);
      onNotice(`Не вдалося завантажити файл (${reason}). Можна вставити URL вручну.`);
    }
  }

  async function saveDocument(document: SiteDocument) {
    try {
      const saved = await saveDocumentServer({ data: document });
      setDocuments((items) =>
        items.map((item) => (item.id === saved.id ? saved : item)).sort(bySortOrder),
      );
      onNotice("Документ збережено в базі.");
    } catch {
      const next = documents.map((item) => (item.id === document.id ? document : item));
      setDocuments(next);
      writeSiteDocuments(next);
      onNotice("База недоступна, документ збережено локально.");
    }
  }

  async function deleteDocument(id: string) {
    try {
      await deleteDocumentServer({ data: { id } });
      const next = await listDocumentsServer();
      setDocuments(next);
      onNotice("Документ видалено з бази.");
    } catch {
      const next = documents.filter((item) => item.id !== id);
      setDocuments(next);
      writeSiteDocuments(next);
      onNotice("Документ видалено локально.");
    }
  }

  function addDocument() {
    const next: SiteDocument = {
      id: crypto.randomUUID(),
      title: "Новий документ",
      description: "Опис документу",
      fileUrl: "",
      sortOrder: (documents.at(-1)?.sortOrder ?? 0) + 10,
    };
    const items = [...documents, next];
    setDocuments(items);
    writeSiteDocuments(items);
  }

  function reset() {
    setDocuments(DEFAULT_DOCUMENTS);
    writeSiteDocuments(DEFAULT_DOCUMENTS);
    onNotice("Документи повернуто до початкових значень локально.");
  }

  return (
    <section className="rounded-lg border border-border bg-background">
      <AdminSectionHeader
        title="Документи"
        description="Дозволи, технічні умови та інші файли, які відкриваються на сайті."
      >
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          Скинути
        </button>
        <button
          onClick={addDocument}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Додати
        </button>
      </AdminSectionHeader>

      <div className="grid gap-4 p-5">
        {[...documents].sort(bySortOrder).map((document) => (
          <article
            key={document.id}
            className="rounded-lg border border-border bg-secondary/30 p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Назва"
                value={document.title}
                onChange={(value) => updateDocument(document.id, { title: value })}
              />
              <NumberField
                label="Порядок"
                value={document.sortOrder}
                onChange={(value) => updateDocument(document.id, { sortOrder: value })}
              />
              <TextField
                label="Опис"
                value={document.description}
                onChange={(value) => updateDocument(document.id, { description: value })}
                className="md:col-span-2"
              />
              <FileUploadField
                label="PDF або фото документу"
                value={document.fileUrl}
                accept="application/pdf,image/*"
                onChange={(value) => updateDocument(document.id, { fileUrl: value })}
                onFile={(file) => uploadDocumentFile(document.id, file)}
                className="md:col-span-2"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => deleteDocument(document.id)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-destructive hover:border-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Видалити
              </button>
              <button
                onClick={() => saveDocument(document)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Save className="h-4 w-4" />
                Зберегти
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConstructionAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const listUpdatesServer = useServerFn(listConstructionUpdatesFn);
  const saveUpdateServer = useServerFn(saveConstructionUpdateFn);
  const deleteUpdateServer = useServerFn(deleteConstructionUpdateFn);
  const uploadImageServer = useServerFn(uploadAdminImageFn);
  const [updates, setUpdates] = useState<ConstructionUpdate[]>(() => readConstructionUpdates());

  useEffect(() => {
    let alive = true;
    listUpdatesServer()
      .then((items) => {
        if (alive) setUpdates(items);
      })
      .catch(() => {
        if (alive) setUpdates(readConstructionUpdates());
      });
    return () => {
      alive = false;
    };
  }, [listUpdatesServer]);

  function updateItem(id: string, patch: Partial<ConstructionUpdate>) {
    setUpdates((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadProgressImage(id: string, file: File) {
    try {
      const optimized = await optimizeImageFile(file);
      const formData = new FormData();
      formData.append("file", dataUrlToFile(optimized, file.name));
      const uploaded = await uploadImageServer({ data: formData });
      updateItem(id, { image: uploaded.url });
      onNotice("Фото ходу будівництва додано. Натисніть зберегти.");
    } catch {
      onNotice("Не вдалося завантажити фото. Можна вставити URL вручну.");
    }
  }

  async function saveUpdate(update: ConstructionUpdate) {
    try {
      const saved = await saveUpdateServer({ data: update });
      setUpdates((items) =>
        items.map((item) => (item.id === saved.id ? saved : item)).sort(bySortOrder),
      );
      onNotice("Запис ходу будівництва збережено в базі.");
    } catch {
      const next = updates.map((item) => (item.id === update.id ? update : item));
      setUpdates(next);
      writeConstructionUpdates(next);
      onNotice("База недоступна, запис збережено локально.");
    }
  }

  async function deleteUpdate(id: string) {
    try {
      await deleteUpdateServer({ data: { id } });
      const next = await listUpdatesServer();
      setUpdates(next);
      onNotice("Запис видалено з бази.");
    } catch {
      const next = updates.filter((item) => item.id !== id);
      setUpdates(next);
      writeConstructionUpdates(next);
      onNotice("Запис видалено локально.");
    }
  }

  function addUpdate() {
    const next: ConstructionUpdate = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      title: "Новий етап",
      description: "Короткий опис виконаних робіт.",
      image: "",
      progress: 10,
      sortOrder: (updates.at(-1)?.sortOrder ?? 0) + 10,
    };
    const items = [...updates, next];
    setUpdates(items);
    writeConstructionUpdates(items);
  }

  function reset() {
    setUpdates(DEFAULT_CONSTRUCTION_UPDATES);
    writeConstructionUpdates(DEFAULT_CONSTRUCTION_UPDATES);
    onNotice("Хід будівництва повернуто до початкових значень локально.");
  }

  return (
    <section className="rounded-lg border border-border bg-background">
      <AdminSectionHeader
        title="Хід будівництва"
        description="Записи з датою, фото, описом і відсотком готовності для публічного блоку."
      >
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          Скинути
        </button>
        <button
          onClick={addUpdate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Додати
        </button>
      </AdminSectionHeader>

      <div className="grid gap-4 p-5">
        {[...updates].sort(bySortOrder).map((update) => (
          <article key={update.id} className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                label="Назва етапу"
                value={update.title}
                onChange={(value) => updateItem(update.id, { title: value })}
                className="md:col-span-2"
              />
              <TextField
                label="Дата"
                value={update.date}
                onChange={(value) => updateItem(update.id, { date: value })}
              />
              <NumberField
                label="Готовність, %"
                value={update.progress}
                onChange={(value) =>
                  updateItem(update.id, { progress: Math.max(0, Math.min(100, value)) })
                }
              />
              <label className="grid gap-1.5 md:col-span-2 xl:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Опис
                </span>
                <textarea
                  value={update.description}
                  onChange={(event) => updateItem(update.id, { description: event.target.value })}
                  rows={3}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <ImageUploadField
                label="Фото етапу"
                value={update.image}
                onChange={(value) => updateItem(update.id, { image: value })}
                onFile={(file) => uploadProgressImage(update.id, file)}
                className="md:col-span-2 xl:col-span-4"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => deleteUpdate(update.id)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-destructive hover:border-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Видалити
              </button>
              <button
                onClick={() => saveUpdate(update)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Save className="h-4 w-4" />
                Зберегти
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MediaAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const readSettingsServer = useServerFn(readSiteSettingsFn);
  const writeSettingsServer = useServerFn(writeSiteSettingsFn);
  const uploadFileServer = useServerFn(uploadAdminFileFn);
  const uploadImageServer = useServerFn(uploadAdminImageFn);
  const [settings, setSettings] = useState<SiteSettings>(() => readSiteSettings());

  useEffect(() => {
    let alive = true;
    readSettingsServer()
      .then((serverSettings) => {
        if (alive) setSettings(serverSettings);
      })
      .catch(() => {
        if (alive) setSettings(readSiteSettings());
      });
    return () => {
      alive = false;
    };
  }, [readSettingsServer]);

  async function uploadVideo(file: File, field: "scrollMediaVideoUrl" | "heroVideoUrl") {
    if (!file.type.startsWith("video/")) {
      onNotice("Оберіть відеофайл.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadFileServer({ data: formData });
      setSettings((current) => ({ ...current, [field]: uploaded.url }));
      onNotice("Відео додано. Натисніть зберегти.");
    } catch {
      onNotice("Не вдалося завантажити відео. Можна вставити URL вручну.");
    }
  }

  async function uploadPoster(file: File, field: "heroPosterUrl" | "scrollPosterUrl") {
    if (!file.type.startsWith("image/")) {
      onNotice("Оберіть файл зображення.");
      return;
    }
    try {
      // Re-encode to a resized JPEG so the preview stays small.
      const optimized = await optimizeImageFile(file);
      const formData = new FormData();
      formData.append("file", dataUrlToFile(optimized, file.name));
      const uploaded = await uploadImageServer({ data: formData });
      setSettings((current) => ({ ...current, [field]: uploaded.url }));
      onNotice("Прев'ю додано. Натисніть зберегти.");
    } catch {
      onNotice("Не вдалося завантажити прев'ю. Можна вставити URL вручну.");
    }
  }

  async function uploadBrand(file: File, field: "logoUrl" | "faviconUrl" | "ogImageUrl") {
    if (!file.type.startsWith("image/")) {
      onNotice("Оберіть файл зображення.");
      return;
    }
    try {
      // Logo and icon keep transparency (WebP); the link preview is a regular JPEG.
      const encoded =
        field === "ogImageUrl"
          ? await optimizeImageFile(file)
          : await optimizeTransparentImage(file, field === "faviconUrl" ? 256 : 512);
      const formData = new FormData();
      formData.append("file", dataUrlToFile(encoded, file.name));
      const uploaded = await uploadImageServer({ data: formData });
      setSettings((current) => ({ ...current, [field]: uploaded.url }));
      onNotice("Зображення додано. Натисніть зберегти.");
    } catch {
      onNotice("Не вдалося завантажити зображення. Можна вставити URL вручну.");
    }
  }

  async function save() {
    try {
      const saved = await writeSettingsServer({ data: settings });
      setSettings(saved);
      onNotice("Медіа-налаштування збережено в базі.");
    } catch {
      writeSiteSettings(settings);
      onNotice("База недоступна, медіа-налаштування збережено локально.");
    }
  }

  function reset() {
    setSettings(DEFAULT_SITE_SETTINGS);
    writeSiteSettings(DEFAULT_SITE_SETTINGS);
    onNotice("Медіа-налаштування скинуто локально.");
  }

  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Медіа</h2>
          <p className="text-sm text-muted-foreground">
            Відео для головного екрана (Hero) і для другого анімованого блоку. Якщо відео немає,
            сайт показує фото.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            Скинути
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Save className="h-4 w-4" />
            Зберегти
          </button>
        </div>
      </div>
      <div className="grid gap-8">
        <div className="grid gap-4 rounded-lg border border-border p-4">
          <h3 className="text-sm font-bold">Бренд і посилання</h3>
          <ImageUploadField
            label="Логотип (шапка і футер)"
            value={settings.logoUrl}
            onChange={(value) => setSettings({ ...settings, logoUrl: value })}
            onFile={(file) => uploadBrand(file, "logoUrl")}
          />
          <ImageUploadField
            label="Іконка вкладки браузера (favicon)"
            value={settings.faviconUrl}
            onChange={(value) => setSettings({ ...settings, faviconUrl: value })}
            onFile={(file) => uploadBrand(file, "faviconUrl")}
          />
          <ImageUploadField
            label="Картинка для прев'ю посилання (месенджери, соцмережі)"
            value={settings.ogImageUrl}
            onChange={(value) => setSettings({ ...settings, ogImageUrl: value })}
            onFile={(file) => uploadBrand(file, "ogImageUrl")}
          />
          <p className="text-xs text-muted-foreground">
            Порожнє поле означає стандартну картинку. Логотип і іконка: квадратне зображення, бажано
            з прозорим фоном (PNG/WebP). Прев'ю посилання: горизонтальне фото, бажано 1200×630.
            Месенджери кешують прев'ю, тож після зміни воно оновиться не одразу.
          </p>
        </div>

        <div>
          <FileUploadField
            label="Відео головного екрана (Hero)"
            value={settings.heroVideoUrl}
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(value) => setSettings({ ...settings, heroVideoUrl: value })}
            onFile={(file) => uploadVideo(file, "heroVideoUrl")}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Відтворюється замість фото в арці, без звуку й по колу, паралакс при скролі
            зберігається. Порожнє поле означає, що показується фото. Потрібен прямий файл MP4 або
            WebM, бажано до 10 МБ та вертикального формату 4:5. Посилання Google Drive і YouTube не
            працюють.
          </p>
          <ImageUploadField
            label="Прев'ю відео головного екрана (JPG, PNG, WebP)"
            value={settings.heroPosterUrl}
            onChange={(value) => setSettings({ ...settings, heroPosterUrl: value })}
            onFile={(file) => uploadPoster(file, "heroPosterUrl")}
            className="mt-4"
          />
          {settings.heroVideoUrl && /drive\.google\.|youtu\.?be/i.test(settings.heroVideoUrl) && (
            <p className="mt-2 text-xs font-semibold text-destructive">
              Це посилання на сторінку перегляду, а не на відеофайл, воно не відтворюється.
              Завантажте файл або вставте пряме посилання на .mp4.
            </p>
          )}
          {settings.heroVideoUrl && (
            <video
              key={settings.heroVideoUrl}
              src={settings.heroVideoUrl}
              className="mt-4 aspect-[4/5] max-h-[420px] rounded-lg bg-secondary object-cover"
              controls
              muted
              playsInline
            />
          )}
        </div>

        <div>
          <FileUploadField
            label="Відеозаставка (другий блок)"
            value={settings.scrollMediaVideoUrl}
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(value) => setSettings({ ...settings, scrollMediaVideoUrl: value })}
            onFile={(file) => uploadVideo(file, "scrollMediaVideoUrl")}
          />
          <ImageUploadField
            label="Прев'ю відеозаставки (JPG, PNG, WebP)"
            value={settings.scrollPosterUrl}
            onChange={(value) => setSettings({ ...settings, scrollPosterUrl: value })}
            onFile={(file) => uploadPoster(file, "scrollPosterUrl")}
            className="mt-4"
          />
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.scrollMediaSound}
              onChange={(e) => setSettings({ ...settings, scrollMediaSound: e.target.checked })}
            />
            Відтворювати зі звуком (браузер може вимагати першого кліку на сторінці)
          </label>
          {settings.scrollMediaVideoUrl && (
            <video
              src={settings.scrollMediaVideoUrl}
              className="mt-4 aspect-video w-full rounded-lg bg-secondary object-cover"
              controls
            />
          )}
        </div>
      </div>
    </section>
  );
}

function AdminSectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(
        1,
        MAX_UPLOAD_IMAGE_SIZE / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas context is unavailable"));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", UPLOAD_IMAGE_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image failed to load"));
    };

    image.src = objectUrl;
  });
}

// Like optimizeImageFile, but encodes WebP so a transparent background survives.
function optimizeTransparentImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas context is unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.92));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image failed to load"));
    };
    image.src = objectUrl;
  });
}

function dataUrlToFile(dataUrl: string, filename: string) {
  const [header, data] = dataUrl.split(",");
  const mime = header?.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binary = atob(data ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

function ImageUploadField({
  label,
  value,
  onChange,
  onFile,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFile: (file: File) => void;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputId = `image-upload-${useId()}`;

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Обрати фото
        </label>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`grid gap-3 rounded-md border border-dashed p-3 transition-colors ${
          dragging ? "border-primary bg-primary-soft" : "border-border bg-secondary/40"
        }`}
      >
        <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-background">
            {value ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">Перетягніть фото сюди</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Або натисніть “Обрати фото”. У продакшені файл збережеться в upload-папку сервера.
            </p>
          </div>
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Або вставте URL фото"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

function FileUploadField({
  label,
  value,
  accept,
  onChange,
  onFile,
  className = "",
}: {
  label: string;
  value: string;
  accept: string;
  onChange: (value: string) => void;
  onFile: (file: File) => void;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  // Must be unique per field instance: several cards share the same label.
  const inputId = `file-upload-${useId()}`;

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Обрати файл
        </label>
      </div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`grid gap-3 rounded-md border border-dashed p-3 transition-colors ${
          dragging ? "border-primary bg-primary-soft" : "border-border bg-secondary/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold">Перетягніть файл сюди</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Або натисніть “Обрати файл”. Можна також вставити готовий URL.
            </p>
          </div>
        </div>
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="URL файлу"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const config = {
    new: { label: "Нова", icon: Clock3, className: "bg-amber-100 text-amber-800" },
    in_progress: { label: "В роботі", icon: Clock3, className: "bg-primary-soft text-forest" },
    done: { label: "Готово", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800" },
  }[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function StatusButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
