import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  TreePine,
  Flame,
  MapPin,
  ShieldCheck,
  Wallet,
  FileText,
  HardHat,
  Bed,
  Ruler,
  ChevronDown,
  Sparkles,
  Building2,
  Home as HomeIcon,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingContacts } from "@/components/site/FloatingContacts";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal, Parallax } from "@/components/site/Reveal";
import heroHouse from "@/assets/hero-house.jpg";
import duplex from "@/assets/type-duplex.jpg";
import townhouse from "@/assets/type-townhouse.jpg";
import cottage from "@/assets/type-cottage.jpg";
import masterplan from "@/assets/masterplan.jpg";
import {
  DEFAULT_CONSTRUCTION_UPDATES,
  DEFAULT_CONTACTS,
  DEFAULT_DOCUMENTS,
  DEFAULT_SITE_SETTINGS,
  readConstructionUpdates,
  readSiteContacts,
  readSiteDocuments,
  readSiteSettings,
} from "@/lib/admin-store";
import { fmtUsd, getHouses } from "@/lib/houses";
import {
  listConstructionUpdatesFn,
  listHousesFn,
  listSiteDocumentsFn,
  readSiteContactsFn,
  readSiteSettingsFn,
} from "@/lib/content.functions";

const LazyHouseSelector = lazy(() =>
  import("@/components/site/HouseSelector").then(({ HouseSelector }) => ({
    default: HouseSelector,
  })),
);
const LazyCurrencyCalculator = lazy(() =>
  import("@/components/site/CurrencyCalculator").then(({ CurrencyCalculator }) => ({
    default: CurrencyCalculator,
  })),
);
const LazyToaster = lazy(() =>
  import("@/components/ui/sonner").then(({ Toaster }) => ({ default: Toaster })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wings Bucha — Крила Бучі | ЖК серед природи, єОселя, 15 хв до Києва" },
      {
        name: "description",
        content:
          "Преміальний еко-ЖК Wings Bucha у Бучі: дуплекси, таунхауси, котеджі серед сосен. Кредит за єОселя, державні сертифікати, 15 хв до Києва.",
      },
      { property: "og:title", content: "Wings Bucha — там, де починається твій політ" },
      {
        property: "og:description",
        content: "Дім серед сосен у Бучі. Еко-простір, преміальна архітектура, єОселя.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-emerald-400 to-primary"
      />
      <Header />
      <main>
        <Hero />
        <ScrollVideo />
        <Marquee />
        <LazyOnView anchorId="houses" minHeight="70vh">
          <LazyHouseSelector />
        </LazyOnView>
        <Masterplan />
        <ConstructionProgress />
        <Financing />
        <LazyOnView anchorId="calculator" minHeight="60vh">
          <LazyCurrencyCalculator />
        </LazyOnView>
        <Documents />
        <Location />
        <Contact />
      </main>

      <Footer />
      <FloatingContacts />
      <IdleToaster />
    </div>
  );
}

function LazyOnView({
  anchorId,
  minHeight,
  children,
}: {
  anchorId: string;
  minHeight: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      id={visible ? undefined : anchorId}
      style={{ minHeight: visible ? undefined : minHeight }}
    >
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

function IdleToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <LazyToaster position="top-center" richColors />
    </Suspense>
  );
}

/* ───────── HERO ───────── */
function Hero() {
  const listHousesServer = useServerFn(listHousesFn);
  const ref = useRef<HTMLDivElement>(null);
  const [heroStats, setHeroStats] = useState({ available: 25, minPrice: 145000 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

  useEffect(() => {
    let alive = true;
    listHousesServer()
      .then((houses) => {
        if (!alive) return;
        setHeroStats({
          available: houses.reduce((total, house) => total + house.available, 0),
          minPrice: Math.min(...houses.map((house) => house.priceUsd)),
        });
      })
      .catch(() => {
        if (!alive) return;
        const houses = getHouses();
        setHeroStats({
          available: houses.reduce((total, house) => total + house.available, 0),
          minPrice: Math.min(...houses.map((house) => house.priceUsd)),
        });
      });
    return () => {
      alive = false;
    };
  }, [listHousesServer]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-background text-foreground">
      {/* Top meta strip */}
      <div className="container-x relative z-10 flex items-center justify-between border-b border-border/60 py-5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        <span>ЖК — Буча · Лісова 28</span>
        <span className="hidden items-center gap-2 md:inline-flex">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Старт продажів · І черга
        </span>
        <span className="serif-italic text-base tracking-normal">10.06.2026</span>
      </div>

      {/* Soft background blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 -z-10 h-[80%] w-[60%] rounded-full bg-primary-soft/60 blur-3xl"
      />

      <div className="container-x relative grid grid-cols-1 items-center gap-14 pt-12 pb-20 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-28">
        {/* LEFT — copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-primary">
            <span className="h-px w-10 bg-primary" />
            Преміальний еко-квартал
          </div>

          <h1 className="mt-7 text-[2.75rem] font-light leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[5.5rem]">
            Дім серед <span className="serif-italic text-forest">сосен,</span>
            <span className="mt-2 block">
              політ <span className="serif-italic text-forest">без меж.</span>
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
            Камерний квартал на 7 гектарах сосен у Бучі. Архітектура з природного каменю та дерева,
            повна газифікація, закрита територія. Кредит за{" "}
            <span className="font-semibold text-foreground">єОселя 3%</span>.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="#houses"
              className="group inline-flex items-center gap-4 rounded-full bg-foreground py-2 pl-7 pr-2 text-sm font-semibold tracking-wide text-background transition-all hover:scale-[1.02] hover:bg-forest"
            >
              Обрати резиденцію
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-foreground"
            >
              Запросити приватний показ
              <span className="h-px w-10 bg-foreground transition-all group-hover:w-16" />
            </a>
          </div>

          <div className="mt-14 grid max-w-lg grid-cols-3 gap-3 border-t border-border/70 pt-8 sm:gap-6">
            <HeroStat value="єОселя" label="акредитований забудовник" italic />
            <HeroStat value="15 хв" label="до центру Києва" />
            <HeroStat value="7 га" label="соснового лісу" />
          </div>
        </motion.div>

        {/* RIGHT — image with floating cards */}
        <div className="relative lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[120px] shadow-[0_40px_120px_-30px_oklch(0.42_0.075_150/0.35)] sm:rounded-[200px] lg:rounded-[280px]"
          >
            <motion.img
              src={heroHouse}
              alt="Wings Bucha — резиденція серед сосен"
              style={{ y: imgY, scale: imgScale }}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Floating — residences */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute right-2 top-4 w-[180px] rounded-3xl bg-foreground p-4 text-background shadow-2xl sm:right-0 sm:top-6 sm:w-[230px] sm:p-5 lg:right-[-20px]"
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-background/60">
              Доступно у І черзі
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="serif-italic text-4xl leading-none sm:text-5xl">
                {heroStats.available}
              </span>
              <span className="text-xs uppercase tracking-wider text-background/70">
                резиденцій
              </span>
            </div>
            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${i < 5 ? "bg-primary" : "bg-background/20"}`}
                />
              ))}
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-background/55">
              5 з 8 черг заброньовано
            </div>
          </motion.div>

          {/* Floating — price */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="absolute -bottom-4 left-2 w-[210px] rounded-3xl bg-background p-4 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.25)] ring-1 ring-border sm:-bottom-6 sm:left-0 sm:w-[270px] sm:p-5 lg:left-[-30px]"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <span>Стартова ціна</span>
              <span>від</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-light tracking-tight sm:text-4xl">
                {fmtUsd(heroStats.minPrice)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs">
              <span className="text-muted-foreground">Кредит від</span>
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-forest">
                3% єОселя
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label, italic }: { value: string; label: string; italic?: boolean }) {
  return (
    <div>
      <div
        className={`text-xl tracking-tight text-foreground sm:text-2xl md:text-[28px] ${italic ? "serif-italic" : "font-light"}`}
      >
        {value}
      </div>
      <div className="mt-2 text-[9px] uppercase tracking-[0.1em] leading-tight text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
        {label}
      </div>
    </div>
  );
}

/* ───────── SCROLL MEDIA ───────── */
function ScrollVideo() {
  const readSettingsServer = useServerFn(readSiteSettingsFn);
  const ref = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Expand from small card to fullscreen during first ~50% of scroll, then hold fullscreen
  const width = useTransform(scrollYProgress, [0, 0.5], ["32%", "100%"]);
  const height = useTransform(scrollYProgress, [0, 0.5], ["38vh", "100vh"]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [32, 0]);
  const videoSrc = settings.scrollMediaVideoUrl.trim();

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

  return (
    <section ref={ref} className="relative h-[300vh] bg-background md:h-[500vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-background">
        <motion.div
          style={{ width, height, borderRadius: radius }}
          className="relative overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,0.45)] will-change-[width,height]"
        >
          {videoSrc ? (
            <video
              src={videoSrc}
              poster={heroHouse}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <motion.img
              src={heroHouse}
              alt="Wings Bucha — відео-блок комплексу"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

function HeroMeta({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="serif-italic text-2xl text-foreground md:text-[28px]">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground leading-tight">
        {label}
      </div>
    </div>
  );
}
function SplitWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </span>
  );
}

function Stat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <div className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </motion.div>
  );
}

/* ───────── MARQUEE ───────── */
function Marquee() {
  const items = [
    "Преміальний еко-ЖК",
    "єОселя 3% / 7%",
    "Сосновий ліс",
    "15 хв до Києва",
    "Повна газифікація",
    "Закрита територія",
    "Державні сертифікати",
  ];
  return (
    <div className="border-y border-border bg-primary-soft/40 py-5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap gap-12">
        {[...items, ...items, ...items].map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-forest"
          >
            <Leaf className="h-4 w-4" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────── ABOUT ───────── */
function About() {
  const items = [
    {
      icon: TreePine,
      title: "Серед природи",
      text: "Сосновий ліс довкола, тиша та свіже повітря щодня.",
    },
    {
      icon: Flame,
      title: "Повна газифікація",
      text: "Магістральний газ — економія та надійність опалення.",
    },
    {
      icon: MapPin,
      title: "15 хвилин до Києва",
      text: "Зручний виїзд, поруч траси та громадський транспорт.",
    },
    {
      icon: ShieldCheck,
      title: "Надійний забудовник",
      text: "Всі дозволи в наявності, прозора документація.",
    },
  ];
  return (
    <section id="about" className="container-x py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-end">
        <Reveal>
          <Eyebrow>Про комплекс</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
            Жити серед природи,
            <br />
            <span className="text-shimmer">залишаючись поруч</span> з містом
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Wings Bucha поєднує сучасну архітектуру, природне оточення та продумане планування для
            сімейного життя. Кожен дім — це простір для родини, де хочеться повертатись.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.1}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card hover-lift hover:border-primary/40 hover:shadow-soft">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-soft opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <motion.div
                whileHover={{ rotate: -8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-forest"
              >
                <it.icon className="h-7 w-7" />
              </motion.div>
              <h3 className="relative mt-6 text-lg font-semibold">{it.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {it.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── HOUSES ───────── */
const houseTypes = [
  {
    id: "duplex",
    img: duplex,
    name: "Дуплекс",
    area: "128 м²",
    beds: "3 спальні",
    price: "від $145 000",
  },
  {
    id: "townhouse",
    img: townhouse,
    name: "Таунхаус",
    area: "96 м²",
    beds: "2 спальні",
    price: "від $112 000",
  },
  {
    id: "cottage",
    img: cottage,
    name: "Котедж",
    area: "165 м²",
    beds: "4 спальні",
    price: "від $189 000",
  },
];

function Houses() {
  return (
    <section id="houses" className="relative bg-secondary/50 py-24 md:py-32 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-x relative">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <Eyebrow>Обрати дім</Eyebrow>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Типи будинків</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Шість форматів житла — від компактних таунхаусів до просторих котеджів серед сосен.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Tag>
                <HomeIcon className="h-3.5 w-3.5" /> Котеджі
              </Tag>
              <Tag>
                <Building2 className="h-3.5 w-3.5" /> Таунхауси
              </Tag>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {houseTypes.map((h, i) => (
            <Reveal key={h.id} delay={i * 0.12} y={40}>
              <motion.article
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                data-analytics-house={h.id}
                onClick={() => trackHouseClick(h.id)}
                className="group h-full cursor-pointer overflow-hidden rounded-3xl bg-card shadow-card hover:shadow-[0_30px_60px_-20px_oklch(0.5_0.07_150/0.3)] transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.img
                    src={h.img}
                    alt={h.name}
                    width={1024}
                    height={768}
                    loading="lazy"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-xs uppercase tracking-[0.2em]">
                      Дослідити планування →
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{h.name}</h3>
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-forest">
                      Доступно
                    </span>
                  </div>
                  <dl className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Ruler className="h-4 w-4" /> {h.area}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4" /> {h.beds}
                    </div>
                  </dl>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                    <div>
                      <div className="text-xl font-bold text-foreground">{h.price}</div>
                      <div className="text-xs text-muted-foreground">≈ {usdToUah(h.price)} ₴</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                      Дивитись <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function trackHouseClick(id: string) {
  if (typeof window !== "undefined") console.info("[analytics] house_view", id);
}

function usdToUah(price: string) {
  const num = Number(price.replace(/[^\d]/g, ""));
  return new Intl.NumberFormat("uk-UA").format(Math.round(num * 41));
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-medium">
      {children}
    </span>
  );
}

/* ───────── FINANCING ───────── */
function Financing() {
  const programs = [
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
      text: "Приймаємо державні житлові сертифікати для ВПО та комбатантів (Постанова 1176).",
    },
    {
      tag: "Ваучер",
      rate: "100%",
      title: "Житловий ваучер",
      text: "Зараховуємо суму ваучера у вартість житла. Допомагаємо з оформленням та супроводом.",
    },
    {
      tag: "Розстрочка",
      rate: "0%",
      title: "Безвідсоткова розстрочка",
      text: "До 24 місяців без переплат від забудовника. Перший внесок від 30%.",
    },
  ];
  return (
    <section id="financing" className="container-x py-24 md:py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary-soft/60 p-8 md:p-16">
          <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gradient-green opacity-20 blur-3xl animate-float-y" />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <Eyebrow>Умови придбання</Eyebrow>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Кредит за <span className="text-shimmer">єОселя</span> та державні сертифікати
              </h2>
              <p className="mt-5 text-muted-foreground">
                Wings Bucha акредитовано у програмах державної підтримки. Допомагаємо з оформленням
                документів та супроводжуємо угоду до ключів.
              </p>
              <a
                href="#contact"
                className="group mt-7 inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-[0_20px_40px_-15px_oklch(0.5_0.07_150/0.5)] transition-shadow"
              >
                <Wallet className="mr-2 h-4 w-4" /> Розрахувати кредит
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <div className="grid gap-4">
              {programs.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex items-start gap-5 rounded-2xl border border-border bg-card p-5 md:p-6 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex h-16 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-animated px-1 text-primary-foreground sm:w-20">
                      <div className="whitespace-nowrap text-sm font-bold leading-none sm:text-base">
                        {p.rate}
                      </div>
                      <div className="mt-1 text-[9px] uppercase tracking-wider opacity-90">
                        {p.tag}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────── MASTERPLAN ───────── */
function Masterplan() {
  return (
    <section className="container-x pt-5 pb-24 md:pb-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.6fr] md:items-center">
        <Reveal>
          <Eyebrow>Генплан</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Територія Wings Bucha
          </h2>
          <p className="mt-4 text-muted-foreground">
            7+ гектарів продуманого простору: пішохідні алеї, дитячі майданчики, зелені дворики без
            авто, власна інфраструктура та цілодобова охорона.
          </p>
          <ul className="mt-7 space-y-3.5 text-sm">
            {[
              "Закрита територія з охороною",
              "Дитячі та спортивні майданчики",
              "Двори без авто",
              "Підземний та гостьовий паркінг",
            ].map((t, i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" /> {t}
                </li>
              </Reveal>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <Parallax offset={40}>
            <div className="overflow-hidden rounded-[2rem] shadow-card hover-lift">
              <img
                src={masterplan}
                alt="Генплан Wings Bucha"
                width={1600}
                height={1000}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── CONSTRUCTION ───────── */
function ConstructionProgress() {
  const listUpdatesServer = useServerFn(listConstructionUpdatesFn);
  const [updates, setUpdates] = useState(DEFAULT_CONSTRUCTION_UPDATES);

  useEffect(() => {
    let alive = true;
    listUpdatesServer()
      .then((items) => {
        if (alive) setUpdates(items.length ? items : DEFAULT_CONSTRUCTION_UPDATES);
      })
      .catch(() => {
        if (alive) setUpdates(readConstructionUpdates());
      });
    return () => {
      alive = false;
    };
  }, [listUpdatesServer]);

  const ordered = [...updates].sort((a, b) => a.sortOrder - b.sortOrder);
  const overall = ordered.length
    ? Math.round(ordered.reduce((sum, item) => sum + item.progress, 0) / ordered.length)
    : 0;

  return (
    <section id="construction" className="bg-secondary/45 py-24 md:py-32">
      <div className="container-x">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[1fr_280px] md:items-end">
            <div>
              <Eyebrow>Хід будівництва</Eyebrow>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
                Роботи йдуть
                <br />
                <span className="text-shimmer">за графіком.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Оновлення з майданчика: етапи, фото та поточна готовність першої черги.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Готовність</span>
                <span>{overall}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(0, Math.min(100, overall))}%` }}
                />
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {ordered.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.1}>
              <article className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="relative aspect-[4/3] bg-background">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={heroHouse}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-80"
                    />
                  )}
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <HardHat className="h-3.5 w-3.5 text-primary" />
                    {formatDate(item.date)}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-forest">
                      {item.progress}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── DOCUMENTS ───────── */
function Documents() {
  const listDocumentsServer = useServerFn(listSiteDocumentsFn);
  const [docs, setDocs] = useState(DEFAULT_DOCUMENTS);

  useEffect(() => {
    let alive = true;
    listDocumentsServer()
      .then((items) => {
        if (alive) setDocs(items.length ? items : DEFAULT_DOCUMENTS);
      })
      .catch(() => {
        if (alive) setDocs(readSiteDocuments());
      });
    return () => {
      alive = false;
    };
  }, [listDocumentsServer]);

  return (
    <section id="docs" className="bg-beige/40 py-24 md:py-32">
      <div className="container-x">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Документи</Eyebrow>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              Прозоро.
              <br />
              <span className="text-shimmer">Відкрито.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Усі дозволи та технічна документація доступні до перегляду без виходу зі сторінки.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {[...docs]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((d, i) => (
                <Accordion key={d.id} index={i} {...d} />
              ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Accordion({
  title,
  description,
  fileUrl,
}: {
  title: string;
  description: string;
  fileUrl: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const isImage = /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/i.test(fileUrl);
  const isPdf = /\.pdf(\?|#|$)/i.test(fileUrl);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition hover:bg-secondary/60"
      >
        <div className="flex items-start gap-4">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <div className="text-base font-semibold">{title}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-secondary/30 px-6 py-6 text-sm text-muted-foreground">
              {fileUrl ? (
                <div className="grid gap-4">
                  {isImage && (
                    <img
                      src={fileUrl}
                      alt={title}
                      loading="lazy"
                      className="max-h-[520px] w-full rounded-xl border border-border bg-background object-contain"
                    />
                  )}
                  {isPdf && (
                    <iframe
                      title={title}
                      src={fileUrl}
                      className="h-[520px] w-full rounded-xl border border-border bg-background"
                      loading="lazy"
                    />
                  )}
                  {!isImage && !isPdf && (
                    <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-border bg-background text-xs uppercase tracking-wider">
                      Файл додано
                    </div>
                  )}
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
                  >
                    Відкрити документ
                  </a>
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-border bg-background text-xs uppercase tracking-wider">
                  Скан документу буде завантажено
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });
}

/* ───────── LOCATION ───────── */
function Location() {
  return (
    <section id="location" className="container-x py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <Eyebrow>Локація</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            м. Буча,
            <br />
            вул. Лісова, 28
          </h2>
          <p className="mt-4 text-muted-foreground">
            15 хвилин до Києва, поруч траса Київ–Ковель. Розвинена інфраструктура: садочки, школи,
            супермаркети, аптеки.
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            {[
              ["3 хв", "до садочка та школи"],
              ["5 хв", "до супермаркету"],
              ["8 хв", "до залізничної станції"],
              ["15 хв", "до Києва"],
            ].map(([t, p], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="flex items-center gap-3">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-forest">
                    {t}
                  </span>
                  <span className="text-muted-foreground">{p}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-[2rem] border border-border shadow-card">
            <iframe
              title="Wings Bucha — м. Буча"
              src="https://maps.google.com/maps?q=Bucha%2C%20Lisova%20St&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="h-full min-h-[460px] w-full"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── CONTACT ───────── */
function Contact() {
  const readSiteContactsServer = useServerFn(readSiteContactsFn);
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);

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

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-animated text-primary-foreground"
    >
      <div className="absolute inset-0 noise-overlay" />
      <Leaf className="absolute top-20 right-[10%] h-16 w-16 text-white/10 animate-leaf" />
      <Leaf
        className="absolute bottom-32 left-[5%] h-12 w-12 text-white/10 animate-leaf"
        style={{ animationDelay: "2s" }}
      />

      <div className="container-x relative grid gap-12 py-24 md:grid-cols-[1fr_1.1fr] md:py-32">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Записатись
          </span>
          <h2 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
            Розправ крила
            <br />
            вдома
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/85">
            Залиште контакт — менеджер зателефонує впродовж 15 хвилин у робочий час, розрахує умови
            та запросить на огляд комплексу.
          </p>
          <div className="mt-9 space-y-3 text-sm">
            <div>
              📞{" "}
              <a href={`tel:${contacts.phoneHref}`} className="font-semibold hover:underline">
                {contacts.phoneDisplay}
              </a>
            </div>
            <div>
              ✉️{" "}
              <a href={`mailto:${contacts.email}`} className="font-semibold hover:underline">
                {contacts.email}
              </a>
            </div>
            <div>📍 {contacts.address}</div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="rounded-[2rem] bg-card p-6 text-foreground shadow-soft md:p-8">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      <span className="h-px w-8 bg-primary" /> {children}
    </span>
  );
}
