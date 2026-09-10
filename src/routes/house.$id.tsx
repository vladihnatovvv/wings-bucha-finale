import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Bed,
  Ruler,
  Home as HomeIcon,
  Layers,
  LayoutGrid,
  Scale,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingContacts } from "@/components/site/FloatingContacts";
import { Toaster } from "@/components/ui/sonner";
import {
  fmtHousePrice,
  fmtHouseSecondaryPrice,
  getHouse,
  getHouses,
  getHouseTypeLabel,
  getUnitStatusLabel,
  type House,
  type UnitStatus,
} from "@/lib/houses";
import { getHouseByIdFn, listHousesFn } from "@/lib/content.functions";

export const Route = createFileRoute("/house/$id")({
  loader: async ({ params }): Promise<{ house: House }> => {
    const house = (await getHouseByIdFn({ data: { id: params.id } })) ?? getHouse(params.id);
    if (!house) throw notFound();
    return { house };
  },
  head: ({ loaderData }) => {
    const h = loaderData?.house;
    if (!h) return { meta: [{ title: "Будинок — Wings Bucha" }] };
    const title = `${h.name} — Wings Bucha`;
    const description = `${h.area} м², ${h.beds} спальні, ${h.floors} поверхи. Ціна від ${fmtHousePrice(h)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: h.img },
        { name: "twitter:image", content: h.img },
      ],
    };
  },
  component: HousePage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-bold">Будинок не знайдено</h1>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> На головну
        </Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-bold">Щось пішло не так</h1>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> На головну
        </Link>
      </div>
      <Footer />
    </div>
  ),
});

type Tab = "facade" | "floor" | "unit";

function HousePage() {
  const getHouseByIdServer = useServerFn(getHouseByIdFn);
  const listHousesServer = useServerFn(listHousesFn);
  const { house: loaderHouse } = Route.useLoaderData() as { house: House };
  const [house, setHouse] = useState(loaderHouse);
  const [others, setOthers] = useState(() =>
    getHouses()
      .filter((h) => h.id !== loaderHouse.id)
      .slice(0, 3),
  );
  const [tab, setTab] = useState<Tab>("facade");
  const [floorIdx, setFloorIdx] = useState(0);
  const [unitIdx, setUnitIdx] = useState(0);

  const typeLabel = getHouseTypeLabel(house.type);

  useEffect(() => {
    setHouse(loaderHouse);
  }, [loaderHouse]);

  useEffect(() => {
    let alive = true;
    Promise.all([getHouseByIdServer({ data: { id: loaderHouse.id } }), listHousesServer()])
      .then(([serverHouse, houses]) => {
        if (!alive) return;
        if (serverHouse) setHouse(serverHouse);
        setOthers(houses.filter((h) => h.id !== loaderHouse.id).slice(0, 3));
      })
      .catch(() => {
        if (!alive) return;
        setOthers(
          getHouses()
            .filter((h) => h.id !== loaderHouse.id)
            .slice(0, 3),
        );
      });
    return () => {
      alive = false;
    };
  }, [getHouseByIdServer, listHousesServer, loaderHouse.id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 md:pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="container-x">
            <Link
              to="/"
              hash="houses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> До всіх будинків
            </Link>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[16/11] overflow-hidden rounded-3xl bg-secondary shadow-card"
              >
                <img src={house.img} alt={house.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-forest backdrop-blur-md">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                  {house.available} вільних одиниць
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {typeLabel}
                </span>
                <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">{house.name}</h1>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-3xl font-bold text-foreground">{fmtHousePrice(house)}</span>
                  <span className="text-sm text-muted-foreground">
                    {fmtHouseSecondaryPrice(house)}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  <Stat
                    icon={<Ruler className="h-4 w-4" />}
                    label="Площа"
                    value={`${house.area} м²`}
                  />
                  <Stat
                    icon={<Bed className="h-4 w-4" />}
                    label="Спальні"
                    value={String(house.beds)}
                  />
                  <Stat
                    icon={<Layers className="h-4 w-4" />}
                    label="Поверхи"
                    value={String(house.floors)}
                  />
                  <Stat
                    icon={<HomeIcon className="h-4 w-4" />}
                    label="Ділянка"
                    value={`${house.plot} сот`}
                  />
                </div>

                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Особливості
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {house.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-forest">
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/"
                    hash="contact"
                    onClick={() => sessionStorage.setItem("house_interest", house.name)}
                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-[0_20px_40px_-15px_oklch(0.5_0.07_150/0.5)]"
                  >
                    Залишити заявку
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/compare"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Scale className="h-4 w-4" /> Порівняти
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs: facade / floor / unit */}
        <section className="container-x mt-16 md:mt-24">
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
            <TabBtn
              active={tab === "facade"}
              onClick={() => setTab("facade")}
              icon={<HomeIcon className="h-4 w-4" />}
            >
              Фасад
            </TabBtn>
            <TabBtn
              active={tab === "floor"}
              onClick={() => setTab("floor")}
              icon={<Layers className="h-4 w-4" />}
            >
              Планування поверху
            </TabBtn>
            <TabBtn
              active={tab === "unit"}
              onClick={() => setTab("unit")}
              icon={<LayoutGrid className="h-4 w-4" />}
            >
              Планування квартир
            </TabBtn>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-3xl bg-secondary/40">
            <div className="relative aspect-[16/10]">
              <AnimatePresence mode="wait">
                {tab === "facade" && (
                  <motion.img
                    key="facade"
                    src={house.facade}
                    alt={house.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {tab === "floor" && (
                  <motion.div
                    key={"floor-" + floorIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center p-6"
                  >
                    <img
                      src={house.floorPlans[floorIdx].img}
                      alt={house.floorPlans[floorIdx].label}
                      className="max-h-full max-w-full"
                    />
                  </motion.div>
                )}
                {tab === "unit" && (
                  <motion.div
                    key={"unit-" + unitIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center p-6"
                  >
                    <img
                      src={house.unitPlans[unitIdx].img}
                      alt={house.unitPlans[unitIdx].label}
                      className="max-h-full max-w-full"
                    />
                    <UnitStatusBadge
                      status={house.unitPlans[unitIdx].status}
                      className="absolute right-5 top-5"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {tab === "floor" && (
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-background/90 p-1 shadow-soft backdrop-blur">
                  {house.floorPlans.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setFloorIdx(i)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        i === floorIdx
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
              {tab === "unit" && (
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-background/90 p-1 shadow-soft backdrop-blur">
                  {house.unitPlans.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setUnitIdx(i)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        i === unitIdx
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label} · {p.area} м² · {getUnitStatusLabel(p.status)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Other houses */}
        {others.length > 0 && (
          <section className="container-x mt-20 md:mt-28 pb-24 md:pb-32">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">Інші формати</h2>
              <Link
                to="/"
                hash="houses"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Усі будинки →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((h) => (
                <OtherCard key={h.id} h={h} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <FloatingContacts />
      <Toaster />
    </div>
  );
}

function UnitStatusBadge({ status, className = "" }: { status?: UnitStatus; className?: string }) {
  const normalized = status ?? "available";
  const classes = {
    available: "bg-emerald-100 text-emerald-800",
    reserved: "bg-amber-100 text-amber-800",
    sold: "bg-rose-100 text-rose-800",
  }[normalized];

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${classes} ${className}`}>
      {getUnitStatusLabel(normalized)}
    </span>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 whitespace-nowrap text-lg font-bold text-foreground md:text-xl">
        {value}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors md:text-sm ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function OtherCard({ h }: { h: House }) {
  return (
    <Link
      to="/house/$id"
      params={{ id: h.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
    >
      <div className="aspect-[16/11] overflow-hidden bg-secondary">
        <img
          src={h.img}
          alt={h.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold">{h.name}</h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3 w-3" /> {h.area} м²
          </span>
          <span className="inline-flex items-center gap-1">
            <Bed className="h-3 w-3" /> {h.beds}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold">{fmtHousePrice(h)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Деталі <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
