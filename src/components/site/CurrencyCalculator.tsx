import { Calculator, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/site/Reveal";

type CalculatorMode = "uah" | "area";

type NbuRate = {
  rate: number;
  exchangedate: string;
};

const NBU_USD_ENDPOINT =
  "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json";
const FALLBACK_USD_RATE = 41;

const fmtMoney = (value: number, currency: "UAH" | "USD") => {
  const amount = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );
  return `${amount} ${currency === "UAH" ? "грн" : "USD"}`;
};

const fmtRate = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);

export function CurrencyCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("area");
  const [rate, setRate] = useState(FALLBACK_USD_RATE);
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateError, setRateError] = useState("");
  const [amountUah, setAmountUah] = useState(4_500_000);
  const [area, setArea] = useState(72);
  const [pricePerSqmUah, setPricePerSqmUah] = useState(62_000);

  async function loadRate() {
    setLoading(true);
    setRateError("");
    try {
      const response = await fetch(NBU_USD_ENDPOINT);
      if (!response.ok) throw new Error("NBU request failed");
      const data = (await response.json()) as NbuRate[];
      const usd = data[0];
      if (!usd?.rate) throw new Error("NBU response is empty");
      setRate(usd.rate);
      setRateDate(usd.exchangedate);
    } catch {
      setRate(FALLBACK_USD_RATE);
      setRateDate("");
      setRateError("Курс НБУ тимчасово недоступний, використано резервний курс.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRate();
  }, []);

  const results = useMemo(() => {
    const totalUah = mode === "area" ? area * pricePerSqmUah : amountUah;
    const totalUsd = totalUah / rate;
    const pricePerSqmUsd = pricePerSqmUah / rate;

    return {
      totalUah,
      totalUsd,
      pricePerSqmUsd,
    };
  }, [amountUah, area, mode, pricePerSqmUah, rate]);

  return (
    <section id="calculator" className="bg-background py-20 md:py-28">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.2fr] lg:items-start">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-8 bg-primary" />
              Калькулятор
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              Перерахунок вартості за курсом НБУ
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Швидко перерахуйте бюджет у долари або порахуйте орієнтовну вартість за площею та
              ціною квадратного метра.
            </p>

            <div className="mt-8 rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Курс USD НБУ
                  </div>
                  <div className="mt-1 text-2xl font-bold">{fmtRate(rate)} грн</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {rateDate ? `Дата курсу: ${rateDate}` : "Резервний курс"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadRate}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Оновити курс НБУ"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
              {rateError && <p className="mt-3 text-xs text-destructive">{rateError}</p>}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-lg border border-border bg-card p-5 shadow-card md:p-6">
              <div className="mb-6 flex flex-wrap gap-2">
                <ModeButton active={mode === "area"} onClick={() => setMode("area")}>
                  м² → долари
                </ModeButton>
                <ModeButton active={mode === "uah"} onClick={() => setMode("uah")}>
                  грн → долари
                </ModeButton>
              </div>

              {mode === "area" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <NumberInput label="Площа, м²" value={area} onChange={setArea} />
                  <NumberInput
                    label="Ціна за м², грн"
                    value={pricePerSqmUah}
                    onChange={setPricePerSqmUah}
                  />
                </div>
              ) : (
                <NumberInput label="Сума, грн" value={amountUah} onChange={setAmountUah} />
              )}

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ResultTile
                  label={mode === "area" ? "Загальна ціна, грн" : "Сума, грн"}
                  value={fmtMoney(results.totalUah, "UAH")}
                />
                <ResultTile
                  label="Орієнтовно, $"
                  value={fmtMoney(results.totalUsd, "USD")}
                  primary
                />
                <ResultTile
                  label="Ціна м², $"
                  value={mode === "area" ? fmtMoney(results.pricePerSqmUsd, "USD") : "—"}
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-md bg-primary-soft p-4 text-sm text-forest">
                <Calculator className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Розрахунок орієнтовний. Фінальну вартість, умови розстрочки чи єОселі підтверджує
                  менеджер.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ModeButton({
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
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-foreground text-background" : "bg-secondary text-foreground hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function NumberInput({
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
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 rounded-md border border-input bg-background px-3 text-base font-semibold outline-none focus:border-primary"
      />
    </label>
  );
}

function ResultTile({
  label,
  value,
  primary,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-md p-4 ${primary ? "bg-foreground text-background" : "bg-secondary/70"}`}
    >
      <div
        className={`text-xs font-semibold uppercase tracking-wide ${primary ? "text-background/60" : "text-muted-foreground"}`}
      >
        {label}
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
