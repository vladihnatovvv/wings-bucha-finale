import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_CONTACTS, readSiteContacts } from "@/lib/admin-store";
import { readSiteContactsFn } from "@/lib/content.functions";

export function FloatingContacts() {
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

  const items = [
    { href: contacts.telegramUrl, label: "Telegram", bg: "bg-[#229ED9]", icon: <TelegramIcon /> },
    {
      href: contacts.whatsappUrl,
      label: "WhatsApp",
      bg: "bg-[#25D366]",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: `tel:${contacts.phoneHref}`,
      label: "Зателефонувати",
      bg: "bg-primary",
      icon: <Phone className="h-5 w-5" />,
    },
  ];
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target={it.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          aria-label={it.label}
          className={`group flex h-12 w-12 items-center justify-center rounded-full text-white shadow-soft transition-transform hover:scale-110 ${it.bg}`}
        >
          {it.icon}
        </a>
      ))}
    </div>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.24 3.64 11.95c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}
