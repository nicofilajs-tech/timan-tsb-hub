/**
 * ============================================================
 * TEMPORARY PREVIEW-ONLY AUTH BYPASS + ROLE SWITCHER
 * ============================================================
 *
 * Enables a fake logged-in user when the app runs in Lovable
 * preview / local development, so the visual UI can be reviewed
 * without a real Supabase login.
 *
 * Also exposes a simple role switcher (timan_admin / dealer_admin
 * / dealer_user) backed by localStorage so designers can flip
 * between layouts/navigation/landing pages instantly.
 *
 * GUARDED so it can NEVER activate in production:
 *   - Requires Vite dev mode (`import.meta.env.DEV`) OR
 *   - A Lovable preview hostname (*.lovable.app / *.lovable.dev /
 *     *.lovableproject.com / localhost)
 *
 * 🔴 REMOVE THIS FILE (and its imports in AuthContext, __root.tsx,
 * routes/index.tsx, routes/login.tsx) before going live.
 * ============================================================
 */

import type { AppUser, RoleCode } from "@/lib/auth";

export type PreviewRoleCode = "timan_admin" | "dealer_admin" | "dealer_user";

const STORAGE_KEY = "lovable-preview-role";
const CHANGE_EVENT = "lovable-preview-role-change";
export const DEFAULT_PREVIEW_ROLE: PreviewRoleCode = "timan_admin";

interface PreviewRoleDefinition {
  code: PreviewRoleCode;
  label: string;
  user: AppUser;
}

export const PREVIEW_ROLES: Record<PreviewRoleCode, PreviewRoleDefinition> = {
  timan_admin: {
    code: "timan_admin",
    label: "Timan Admin",
    user: {
      id: "preview-timan-admin-0000-0000-0000-000000000001",
      email: "preview-admin@timan.local",
      fullName: "Preview Timan Admin",
      companyName: "Timan (Preview)",
      role: "timan_admin",
    },
  },
  dealer_admin: {
    code: "dealer_admin",
    label: "Dealer Admin",
    user: {
      id: "preview-dealer-admin-0000-0000-0000-000000000002",
      email: "preview-dealer-admin@dealer.local",
      fullName: "Preview Dealer Admin",
      companyName: "Demo Forhandler A/S (Preview)",
      role: "dealer_admin",
    },
  },
  dealer_user: {
    code: "dealer_user",
    label: "Dealer User",
    user: {
      id: "preview-dealer-user-0000-0000-0000-000000000003",
      email: "preview-dealer-user@dealer.local",
      fullName: "Preview Dealer User",
      companyName: "Demo Forhandler A/S (Preview)",
      role: "dealer_user",
    },
  },
};

/** Backwards-compatible export — kept so existing imports keep working. */
export const PREVIEW_ADMIN_USER: AppUser = PREVIEW_ROLES.timan_admin.user;

/**
 * Returns true ONLY in dev / Lovable preview environments.
 * Returns false in any real production deployment.
 */
export function isPreviewAuthBypassEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.DEV) return true;

  const host = window.location.hostname;
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com")
  ) {
    return true;
  }
  return false;
}

function isValidRole(value: string | null): value is PreviewRoleCode {
  return value === "timan_admin" || value === "dealer_admin" || value === "dealer_user";
}

export function getPreviewRole(): PreviewRoleCode {
  if (typeof window === "undefined") return DEFAULT_PREVIEW_ROLE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidRole(stored)) return stored;
  } catch {
    // ignore (private mode etc.)
  }
  return DEFAULT_PREVIEW_ROLE;
}

export function setPreviewRole(role: PreviewRoleCode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, role);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: role }));
}

/**
 * Subscribe to preview role changes (same-tab + cross-tab).
 * Returns an unsubscribe function.
 */
export function subscribePreviewRole(cb: (role: PreviewRoleCode) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<PreviewRoleCode>).detail;
    if (isValidRole(detail)) cb(detail);
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && isValidRole(e.newValue)) cb(e.newValue);
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function getPreviewUser(role: PreviewRoleCode = getPreviewRole()): AppUser {
  return PREVIEW_ROLES[role].user;
}

export const ADMIN_PREVIEW_ROLES: RoleCode[] = ["super_admin", "timan_admin", "timan_support"];
