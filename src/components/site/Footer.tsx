import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-wings.png";
import { DEFAULT_CONTACTS, readSiteContacts } from "@/lib/admin-store";
import { readSiteContactsFn } from "@/lib/content.functions";

export function Footer() {
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
    <footer className="border-t border-border bg-secondary/50">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Wings Bucha" className="h-10 w-10" width={40} height={40} />
              <div>
                <div className="text-base font-bold">WINGS BUCHA</div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Крила Бучі
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Сучасний житловий комплекс серед лісу, у 15 хвилинах від Києва. Дім, де народжуються
              крила.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Контакти</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={`tel:${contacts.phoneHref}`} className="hover:text-primary">
                  {contacts.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contacts.email}`} className="hover:text-primary">
                  {contacts.email}
                </a>
              </li>
              <li>{contacts.address}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Забудовник</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>ТОВ «Крила Бучі Девелопмент»</li>
              <li>ЄДРПОУ: 44851237</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Wings Bucha. Усі права захищені.</span>
          <span>Світла, мінімалістична та природна архітектура</span>
        </div>
      </div>
    </footer>
  );
}
