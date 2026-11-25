import { MessageCircle, Facebook, Instagram, Send } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteContacts } from "@/lib/admin-store";

export function hasValue(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export type SocialLink = { href: string; label: string; icon: ReactNode };

// Only the networks that are filled in on the admin "Контакти" tab are returned.
export function getSocialLinks(contacts: SiteContacts, iconClass = "h-5 w-5"): SocialLink[] {
  const all: { href: string; label: string; icon: ReactNode }[] = [
    { href: contacts.telegramUrl, label: "Telegram", icon: <Send className={iconClass} /> },
    {
      href: contacts.whatsappUrl,
      label: "WhatsApp",
      icon: <MessageCircle className={iconClass} />,
    },
    { href: contacts.instagramUrl, label: "Instagram", icon: <Instagram className={iconClass} /> },
    { href: contacts.facebookUrl, label: "Facebook", icon: <Facebook className={iconClass} /> },
    { href: contacts.tiktokUrl, label: "TikTok", icon: <TikTokIcon className={iconClass} /> },
  ];
  return all
    .filter((item) => hasValue(item.href))
    .map((item) => ({ ...item, href: item.href.trim() }));
}

export function SocialLinks({
  contacts,
  className = "",
  linkClassName = "",
}: {
  contacts: SiteContacts;
  className?: string;
  linkClassName?: string;
}) {
  const links = getSocialLinks(contacts);
  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.label}
          title={link.label}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${linkClassName}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
