import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Plus, Scale, X } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingContacts } from "@/components/site/FloatingContacts";
import { Toaster } from "@/components/ui/sonner";
import {
  fmtHousePrice,
  fmtUahAmount,
  fmtUsd,
  getHousePriceUah,
  getHouses,
  readCompare,
  writeCompare,
  type House,
} from "@/lib/houses";
import { listHousesFn } from "@/lib/content.functions";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Порівняння будинків — Wings Bucha" },
      {
        name: "description",
        content:
          "Порівняйте до 3 форматів житла Wings Bucha поруч: площа, спальні, ціна та особливості.",
      },
      { property: "og:title", content: "Порівняння будинків — Wings Bucha" },
      {
        property: "og:description",
        content: "Зручне порівняння дуплексів, таунхаусів і котеджів Wings Bucha.",
      },
    ],
  }),
  component: ComparePage,
});

const ROWS: { label: string; get: (h: House) => string }[] = [
  { label: "Площа", get: (h) => `${h.area} м²` },
  { label: "Спальні", get: (h) => String(h.beds) },
  { label: "Санвузли", get: (h) => String(h.baths) },
  { label: "Поверхи", get: (h) => String(h.floors) },
  { label: "Ділянка", get: (h) => `${h.plot} сот` },
  { label: "Доступно", get: (h) => `${h.available} од.` },
  { label: "Ціна USD", get: (h) => fmtUsd(h.priceUsd) },
  { label: "Ціна UAH", get: (h) => fmtUahAmount(getHousePriceUah(h)) },
];

function ComparePage() {
  const listHousesServer = useServerFn(listHousesFn);
  const [ids, setIds] = useState<string[]>([]);
  const [allHouses, setAllHouses] = useState<House[]>(() => getHouses());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    listHousesServer()
      .then((houses) => {
        if (!alive) return;
        setAllHouses(houses);
        setIds(readCompare());
        setHydrated(true);
      })
      .catch(() => {
        if (!alive) return;
        setAllHouses(getHouses());
        setIds(readCompare());
        setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, [listHousesServer]);

  useEffect(() => {
    if (hydrated) writeCompare(ids);
  }, [ids, hydrated]);

  const houses = allHouses.filter((h) => ids.includes(h.id));
  const remaining = allHouses.filter((h) => !ids.includes(h.id));

  const remove = (id: string) => setIds((p) => p.filter((x) => x !== id));
  const add = (id: string) => setIds((p) => (p.length >= 3 || p.includes(id) ? p : [...p, id]));

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header />
      <main className="pt-28 pb-24 md:pt-32">
        <div className="container-x">
          <Link
            to="/"
            hash="houses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> До вибору формату
          </Link>

          <div className="mt-6 flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Scale className="h-3.5 w-3.5" /> Порівняння
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              {houses.length === 0
                ? "Оберіть формати для порівняння"
                : `Порівнюємо ${houses.length} формат${houses.length === 1 ? "" : "и"}`}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Додавайте до 3 будинків і порівнюйте їх характеристики поруч.
            </p>
          </div>

          {hydrated && houses.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                Список порівняння порожній. Поверніться на головну й додайте варіанти.
              </p>
              <Link
                to="/"
                hash="houses"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-[0_20px_40px_-15px_oklch(0.5_0.07_150/0.5)]"
              >
                Обрати будинки
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <div className="mt-12 overflow-x-auto">
              <div
                className="grid min-w-[640px] gap-4"
                style={{
                  gridTemplateColumns: `160px repeat(${Math.max(houses.length, 1)}, minmax(200px, 1fr))`,
                }}
              >
                <div />
                {houses.map((h) => (
                  <motion.div
                    key={h.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={h.img} alt={h.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-bold">{h.name}</div>
                      <div className="mt-1 text-sm font-semibold text-primary">
                        {fmtHousePrice(h)}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(h.id)}
                      aria-label="Прибрати з порівняння"
                      className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}

                {ROWS.map((row, ri) => (
                  <CompareRow
                    key={row.label}
                    label={row.label}
                    values={houses.map((h) => row.get(h))}
                    delay={ri * 0.04}
                  />
                ))}
              </div>
            </div>
          )}

          {hydrated && houses.length > 0 && houses.length < 3 && remaining.length > 0 && (
            <div className="mt-10 rounded-3xl border border-border bg-secondary/40 p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Додати ще
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {remaining.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => add(h.id)}
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                    {h.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hydrated && houses.length > 0 && (
            <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Не визначились? Менеджер допоможе з вибором.
              </div>
              <Link
                to="/"
                hash="contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-[0_20px_40px_-15px_oklch(0.5_0.07_150/0.5)]"
              >
                Залишити заявку на консультацію
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingContacts />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function CompareRow({ label, values, delay }: { label: string; values: string[]; delay: number }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </motion.div>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.05 + i * 0.04 }}
          className="flex items-center rounded-xl bg-secondary/50 px-4 py-3 text-sm font-semibold text-foreground"
        >
          {v}
        </motion.div>
      ))}
    </>
  );
}
