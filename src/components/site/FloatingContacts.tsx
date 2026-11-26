import { useState } from "react";
import { ChevronDown, Facebook, Instagram, MessageCircle, Phone } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { hasValue, TikTokIcon } from "@/components/site/SocialLinks";

export function FloatingContacts() {
  const { contacts } = useSiteContent();
  const [open, setOpen] = useState(true);

  const items = [
    { href: contacts.telegramUrl, label: "Telegram", bg: "bg-[#229ED9]", icon: <TelegramIcon /> },
    {
      href: contacts.whatsappUrl,
      label: "WhatsApp",
      bg: "bg-[#25D366]",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: contacts.instagramUrl,
      label: "Instagram",
      bg: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
      icon: <Instagram className="h-5 w-5" />,
    },
    {
      href: contacts.facebookUrl,
      label: "Facebook",
      bg: "bg-[#1877F2]",
      icon: <Facebook className="h-5 w-5" />,
    },
    {
      href: contacts.tiktokUrl,
      label: "TikTok",
      bg: "bg-black",
      icon: <TikTokIcon className="h-5 w-5" />,
    },
    {
      href: hasValue(contacts.phoneHref) ? `tel:${contacts.phoneHref.trim()}` : "",
      label: "Зателефонувати",
      bg: "bg-primary",
      icon: <Phone className="h-5 w-5" />,
    },
  ].filter((item) => hasValue(item.href) && item.href !== "tel:");

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Згорнути контакти" : "Розгорнути контакти"}
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-soft transition-transform hover:scale-110"
      >
        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
      {open &&
        items.map((it) => (
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
