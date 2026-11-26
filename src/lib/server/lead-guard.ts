import { getRequestHeader } from "@tanstack/react-start/server";
import type { Lead } from "@/lib/admin-store";

export type LeadInput = Omit<Lead, "id" | "createdAt" | "status"> & { website?: string };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function clientIp(): string {
  const real = getRequestHeader("x-real-ip");
  const fwd = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
  return real || fwd || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (now - (times.at(-1) ?? 0) > WINDOW_MS) hits.delete(key);
  }
  return false;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Returns a clean lead to save, or null when the request should be silently dropped
 * (bot / invalid / flooding). The caller answers "success" either way so bots learn nothing.
 */
export function guardLead(raw: LeadInput): Omit<Lead, "id" | "createdAt" | "status"> | null {
  // Honeypot: hidden field that humans never fill.
  if (raw?.website) return null;

  const name = str(raw?.name, 80);
  const phone = str(raw?.phone, 20);
  const email = str(raw?.email, 120);
  if (name.length < 2) return null;
  if (!/^[+\d\s()-]{7,20}$/.test(phone)) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  // Links in the comment are almost always spam.
  const message = str(raw?.message, 600);
  if (/https?:\/\/|www\./i.test(message)) return null;

  if (rateLimited(clientIp())) return null;

  return {
    name,
    phone,
    email,
    interest: str(raw?.interest, 100),
    message,
    // Fixed on the server: the client cannot choose which site the lead belongs to.
    site_name: "Крила Бучі",
  };
}
