import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Maximize2,
  Bed,
  Ruler,
  Home as HomeIcon,
  Layers,
  LayoutGrid,
  ArrowRight,
  Check,
} from "lucide-react";
import { fmtHousePrice, fmtHouseSecondaryPrice, type House } from "@/lib/houses";

type Tab = "facade" | "floor" | "unit";

export function HouseModal({ house, onClose }: { house: House | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("facade");
  const [floorIdx, setFloorIdx] = useState(0);
  const [unitIdx, setUnitIdx] = useState(0);

  useEffect(() => {
    if (!house) return;
    setTab("facade");
    setFloorIdx(0);
    setUnitIdx(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [house, onClose]);

  return (
    <AnimatePresence>
      {house && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-stretch bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative m-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-background md:h-[92dvh] md:max-w-[1200px] md:rounded-3xl md:shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-8">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {house.type === "duplex"
                    ? "Дуплекс"
                    : house.type === "townhouse"
                      ? "Таунхаус"
                      : "Котедж"}
                </div>
                <h3 className="mt-0.5 truncate text-xl font-bold md:text-2xl">{house.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <div className="text-lg font-bold">{fmtHousePrice(house)}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {fmtHouseSecondaryPrice(house)}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Закрити"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border bg-secondary/40 px-3 py-2 md:px-6">
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

            {/* Body */}
            <div className="grid flex-1 grid-rows-[1fr_auto] overflow-hidden md:grid-cols-[1.6fr_1fr] md:grid-rows-1">
              {/* Visual */}
              <div className="relative overflow-hidden bg-secondary/40">
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selector pills for floor/unit */}
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
                        {p.label} · {p.area} м²
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info side */}
              <div className="flex flex-col overflow-y-auto border-t border-border bg-card p-5 md:border-l md:border-t-0 md:p-7">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <Stat label="Площа" value={`${house.area} м²`} />
                  <Stat label="Спальні" value={String(house.beds)} />
                  <Stat label="Поверхи" value={String(house.floors)} />
                  <Stat label="Ділянка" value={`${house.plot} сот`} />
                </div>

                <div className="mt-5 rounded-2xl bg-primary-soft/60 p-4 md:hidden">
                  <div className="text-lg font-bold text-foreground">{fmtHousePrice(house)}</div>
                  <div className="text-xs text-muted-foreground">
                    {fmtHouseSecondaryPrice(house)}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Особливості
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-2.5">
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

                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Доступно
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-forest">
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                    </span>
                    {house.available} вільних одиниць
                  </div>
                </div>

                <a
                  href="#contact"
                  onClick={() => {
                    sessionStorage.setItem("house_interest", house.name);
                    onClose();
                  }}
                  className="group mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-[0_20px_40px_-15px_oklch(0.5_0.07_150/0.5)]"
                >
                  Залишити заявку
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

// Re-export icons used externally? Keep imports minimal here.
export { Maximize2, Bed, Ruler };
