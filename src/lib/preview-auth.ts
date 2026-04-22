/**
 * ============================================================
 * TEMPORARY PREVIEW-ONLY AUTH BYPASS
 * ============================================================
 *
 * This module enables a fake "Timan Admin" user when the app is
 * running in Lovable preview / local development, so the visual
 * UI can be reviewed without a real Supabase login.
 *
 * It is GUARDED so it can NEVER activate in production:
 *   - Requires Vite dev mode (`import.meta.env.DEV`) OR
 *   - A Lovable preview hostname (*.lovable.app / *.lovable.dev / localhost)
 *
 * Production builds served from a real custom domain will NOT
 * trigger the bypass and the normal Supabase auth flow remains intact.
 *
 * 🔴 REMOVE THIS FILE (and its imports in AuthContext + routes/index.tsx)
 * before going live with real users.
 * ============================================================
 */

import type { AppUser } from "@/lib/auth";

export const PREVIEW_ADMIN_USER: AppUser = {
  id: "preview-admin-00000000-0000-0000-0000-000000000001",
  email: "preview-admin@timan.local",
  fullName: "Preview Admin",
  companyName: "Timan (Preview)",
  role: "timan_admin",
};

/**
 * Returns true ONLY in dev / Lovable preview environments.
 * Returns false in any real production deployment.
 */
export function isPreviewAuthBypassEnabled(): boolean {
  // SSR safety — never enable during server render
  if (typeof window === "undefined") return false;

  // Vite dev server
  if (import.meta.env.DEV) return true;

  // Lovable preview / sandbox hostnames
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
