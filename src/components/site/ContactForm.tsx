import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addLead } from "@/lib/admin-store";
import { readHouseTypes } from "@/lib/houses";
import { createLeadFn, listHouseTypesFn } from "@/lib/content.functions";

export function ContactForm() {
  const createLeadServer = useServerFn(createLeadFn);
  const listHouseTypesServer = useServerFn(listHouseTypesFn);
  const [loading, setLoading] = useState(false);
  const [houseTypes, setHouseTypes] = useState(() => readHouseTypes());

  useEffect(() => {
    let alive = true;
    listHouseTypesServer()
      .then((types) => {
        if (alive) setHouseTypes(types);
      })
      .catch(() => {
        if (alive) setHouseTypes(readHouseTypes());
      });
    return () => {
      alive = false;
    };
  }, [listHouseTypesServer]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    if (name.length < 2 || name.length > 80) return toast.error("Введіть коректне ім'я");
    if (!/^[+\d\s()-]{7,20}$/.test(phone)) return toast.error("Введіть коректний номер телефону");
    setLoading(true);
    const lead = {
      name,
      phone,
      email: String(fd.get("email") ?? "").trim(),
      interest: String(fd.get("interest") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };

    try {
      await createLeadServer({ data: lead });
    } catch {
      addLead(lead);
    }

    window.setTimeout(() => {
      setLoading(false);
      toast.success("Дякуємо! Менеджер зв'яжеться з вами найближчим часом.");
      form.reset();
    }, 700);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ім'я" name="name" placeholder="Ваше ім'я" maxLength={80} required />
        <Field
          label="Телефон"
          name="phone"
          placeholder="+380 __ ___ __ __"
          maxLength={20}
          required
          type="tel"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="email@example.com"
          maxLength={120}
        />
        <div className="grid gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Цікавить
          </label>
          <select
            name="interest"
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          >
            {houseTypes.map((type) => (
              <option key={type.id}>{type.label}</option>
            ))}
            <option>Консультація з єОселя</option>
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Коментар
        </label>
        <textarea
          name="message"
          rows={3}
          maxLength={600}
          placeholder="Коротко напишіть, що для вас важливо"
          className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        disabled={loading}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? "Надсилаємо…" : "Записатись на огляд"}
      </button>
      <p className="text-xs text-muted-foreground">
        Натискаючи кнопку, ви погоджуєтесь з обробкою персональних даних.
      </p>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        {...props}
        className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
