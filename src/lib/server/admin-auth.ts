import { createHash, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE_NAME = "wb_admin_session";
const DEV_PASSWORD = "admin";

function configuredPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return password;
  return process.env.NODE_ENV === "production" ? "" : DEV_PASSWORD;
}

function tokenForPassword(password: string) {
  const salt = process.env.ADMIN_SESSION_SECRET || "wings-bucha-admin";
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function getAdminAuthState() {
  const password = configuredPassword();
  const configured = Boolean(process.env.ADMIN_PASSWORD?.trim());
  const expectedToken = password ? tokenForPassword(password) : "";
  const cookieToken = getCookie(COOKIE_NAME) ?? "";
  return {
    authenticated: Boolean(expectedToken && safeEqual(cookieToken, expectedToken)),
    configured,
    usesDevPassword: !configured && process.env.NODE_ENV !== "production",
  };
}

export function loginAdmin(password: string) {
  const expectedPassword = configuredPassword();
  if (!expectedPassword || password !== expectedPassword) {
    throw new Error("Invalid admin password");
  }

  setCookie(COOKIE_NAME, tokenForPassword(expectedPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });

  return getAdminAuthState();
}

export function logoutAdmin() {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { authenticated: false, configured: Boolean(process.env.ADMIN_PASSWORD?.trim()) };
}

export function requireAdmin() {
  if (!getAdminAuthState().authenticated) {
    throw new Error("Admin authorization is required");
  }
}
