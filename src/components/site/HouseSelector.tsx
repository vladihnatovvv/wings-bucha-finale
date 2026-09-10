import { useState, useMemo, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  animate,
} from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Bed,
  Ruler,
  ArrowRight,
  Check,
  Scale,
  Home as HomeIcon,
  Building2,
  Trees,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import {
  fmtHousePrice,
  fmtHouseSecondaryPrice,
  getHouseTypePluralLabel,
  getHouses,
  readCompare,
  readHouseTypes,
  writeCompare,
  type House,
} from "@/lib/houses";
import { listHousesFn, listHouseTypesFn } from "@/lib/content.functions";

function iconForType(type: string) {
  if (type === "duplex") return HomeIcon;
  if (type === "cottage") return Trees;
  return Building2;
}

export function HouseSelector() {
  const listHousesServer = useServerFn(listHousesFn);
  const listHouseTypesServer = useServerFn(listHouseTypesFn);
  const [filter, setFilter] = useState("all");
  const [houses, setHouses] = useState<House[]>(() => getHouses());
  const [activeId, setActiveId] = useState(() => houses[0]?.id ?? "");
  const [compare, setCompare] = useState<string[]>([]);
  const [houseTypes, setHouseTypes] = useState(() => readHouseTypes());

  useEffect(() => {
    setCompare(readCompare());
  }, []);
  useEffect(() => {
    writeCompare(compare);
  }, [compare]);
  useEffect(() => {
    let alive = true;
    Promise.all([listHousesServer(), listHouseTypesServer()])
      .then(([serverHouses, serverTypes]) => {
        if (!alive) return;
        setHouses(serverHouses);
        setHouseTypes(serverTypes);
        setActiveId((current) =>
          serverHouses.some((house) => house.id === current)
            ? current
            : (serverHouses[0]?.id ?? ""),
        );
      })
      .catch(() => {
        if (!alive) return;
        setHouses(getHouses());
        setHouseTypes(readHouseTypes());
      });
    return () => {
      alive = false;
    };
  }, [listHousesServer, listHouseTypesServer]);

  const active = houses.find((house) => house.id === activeId) ?? houses[0];
  const filters = useMemo(() => {
    const usedTypes = Array.from(new Set(houses.map((house) => house.type)));
    return [
      { id: "all", label: "Всі формати", icon: Sparkles },
      ...usedTypes.map((type) => ({
        id: type,
        label:
          houseTypes.find((item) => item.id === type)?.pluralLabel ?? getHouseTypePluralLabel(type),
        icon: iconForType(type),
      })),
    ];
  }, [houses, houseTypes]);

  const visible = useMemo(
    () => (filter === "all" ? houses : houses.filter((h) => h.type === filter)),
    [filter, houses],
  );

  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  if (!active) return null;

  return (
    <>
      <section id="houses" className="relative bg-secondary/50 py-24 md:py-32 overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          aria-hidden
          className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 25, -15, 0], scale: [1, 0.9, 1.05, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating sparkles */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-primary/40"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            />
          ))}
        </div>

        <div className="container-x relative">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-px w-8 bg-primary" /> Обрати дім
              </span>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
                Інтерактивний вибір
                <br />
                <span className="text-shimmer">вашого формату</span>
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Фільтруйте формати, порівнюйте до 3 варіантів і обирайте дім, що пасує саме вам.
              </p>
            </Reveal>

            <AnimatePresence>
              {compare.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                >
                  <Link
                    to="/compare"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-soft hover:scale-[1.03] transition-transform"
                  >
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                    />
                    <Scale className="relative h-4 w-4" />
                    <span className="relative">Порівняти ({compare.length})</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filters */}
          <LayoutGroup>
            <div className="mt-10 flex flex-wrap gap-2">
              {filters.map((f) => {
                const isActive = filter === f.id;
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? "text-primary-foreground" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-full bg-gradient-animated shadow-soft"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            {/* List */}
            <LayoutGroup>
              <motion.div layout className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {visible.map((h) => {
                    const isActive = active.id === h.id;
                    const inCompare = compare.includes(h.id);
                    return (
                      <motion.article
                        key={h.id}
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -4 }}
                        onClick={() => setActiveId(h.id)}
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-5 transition-all ${
                          isActive
                            ? "border-primary shadow-soft"
                            : "border-border hover:border-primary/40 hover:shadow-soft"
                        }`}
                      >
                        {isActive && (
                          <>
                            <motion.span
                              layoutId="active-house-indicator"
                              className="absolute inset-y-0 left-0 w-1 bg-gradient-green"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <motion.span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 rounded-2xl"
                              style={{
                                background:
                                  "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), oklch(0.7 0.12 150 / 0.08), transparent 40%)",
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            />
                          </>
                        )}
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ scale: 1.06, rotate: -1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"
                          >
                            <img
                              src={h.img}
                              alt={h.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {isActive && (
                              <motion.span
                                aria-hidden
                                className="absolute inset-0 ring-2 ring-primary rounded-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              />
                            )}
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-base font-bold leading-snug">{h.name}</h3>
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest">
                                <PulseDot />
                                {h.available} вільно
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Ruler className="h-3 w-3" /> {h.area} м²
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Bed className="h-3 w-3" /> {h.beds}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-foreground">
                                {fmtHousePrice(h)}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(h.id);
                                }}
                                disabled={!inCompare && compare.length >= 3}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                                  inCompare
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                                }`}
                              >
                                {inCompare ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Scale className="h-3 w-3" />
                                )}
                                {inCompare ? "У порівнянні" : "Порівняти"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
                {visible.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    За цим фільтром поки немає варіантів.
                  </div>
                )}
              </motion.div>
            </LayoutGroup>

            {/* Showcase */}
            <div className="relative">
              <div className="sticky top-28">
                <TiltCard>
                  <div className="overflow-hidden rounded-3xl bg-card shadow-card">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Link
                          to="/house/$id"
                          params={{ id: active.id }}
                          className="group/img relative block aspect-[16/11] cursor-pointer overflow-hidden"
                        >
                          <motion.img
                            key={active.img}
                            src={active.img}
                            alt={active.name}
                            initial={{ scale: 1.18, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {/* Floating badge */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-forest backdrop-blur-md shadow-soft"
                          >
                            <PulseDot />
                            {active.available} вільних одиниць
                          </motion.div>

                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition-colors group-hover/img:bg-primary"
                          >
                            <Maximize2 className="h-3 w-3" /> Відкрити сторінку
                          </motion.span>

                          <div className="absolute bottom-5 left-5 right-5 text-white">
                            <motion.h3
                              key={"t-" + active.id}
                              initial={{ y: 18, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.15 }}
                              className="text-2xl font-bold md:text-3xl"
                            >
                              {active.name}
                            </motion.h3>
                            <motion.div
                              key={"p-" + active.id}
                              initial={{ y: 18, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.25 }}
                              className="mt-1 text-sm opacity-90"
                            >
                              {fmtHousePrice(active)} • {fmtHouseSecondaryPrice(active)}
                            </motion.div>
                          </div>
                        </Link>

                        <div className="p-6 md:p-8">
                          <div className="grid grid-cols-2 gap-3 border-b border-border pb-5 sm:grid-cols-4">
                            <Spec label="Площа" value={active.area} suffix=" м²" />
                            <Spec label="Спальні" value={active.beds} />
                            <Spec label="Поверхи" value={active.floors} />
                            <Spec label="Ділянка" value={active.plot} suffix=" сот" />
                          </div>

                          <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {active.features.map((f, i) => (
                              <motion.li
                                key={active.id + f}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.07 }}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <motion.span
                                  whileHover={{ scale: 1.2, rotate: 10 }}
                                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-forest"
                                >
                                  <Check className="h-3 w-3" />
                                </motion.span>
                                {f}
                              </motion.li>
                            ))}
                          </ul>

                          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <motion.a
                              href="#contact"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => sessionStorage.setItem("house_interest", active.name)}
                              className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-[0_20px_40px_-15px_oklch(0.5_0.07_150/0.5)]"
                            >
                              <motion.span
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                              />
                              <span className="relative">
                                Залишити заявку на {active.name.split(" ")[0]}
                              </span>
                              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </motion.a>
                            <Link
                              to="/house/$id"
                              params={{ id: active.id }}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                              <Maximize2 className="h-4 w-4" />
                              Сторінка будинку
                            </Link>
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => toggleCompare(active.id)}
                              aria-label="Порівняти"
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                              <Scale className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Spec({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) =>
        setDisplay(Number.isInteger(value) ? Math.round(v) : Math.round(v * 10) / 10),
    });
    return () => controls.stop();
  }, [value, inView]);

  return (
    <div ref={ref} className="text-center">
      <div className="whitespace-nowrap text-lg font-bold text-foreground md:text-xl tabular-nums">
        {display}
        {suffix}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function PulseDot() {
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}
