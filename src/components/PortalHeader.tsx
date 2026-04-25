/**
 * Shared top navigation/header for the Timan Service Portal.
 *
 * Used on the dashboard, Service / Claims, and TSB pages so the visual
 * chrome stays consistent across the platform.
 *
 * Layout: logo • language switcher (DK/GB/DE/IT/HU) • bell • user block
 *         • initials avatar • logout.
 *
 * Language is persisted in localStorage under "timan.portal.lang" and
 * exposed via `usePortalLanguage()` so module pages (e.g. ClaimTool) can
 * react to the user's choice.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import timanLogo from "@/assets/timan-logo.png";

export const PORTAL_LANGUAGES = ["DK", "GB", "DE", "IT", "HU"] as const;
export type PortalLang = (typeof PORTAL_LANGUAGES)[number];

const LANG_STORAGE_KEY = "timan.portal.lang";

function readStoredLang(): PortalLang {
  if (typeof window === "undefined") return "DK";
  const v = window.localStorage.getItem(LANG_STORAGE_KEY);
  return (PORTAL_LANGUAGES as readonly string[]).includes(v ?? "")
    ? (v as PortalLang)
    : "DK";
}

/**
 * React hook returning the currently selected portal language and a
 * setter that persists the choice and broadcasts it to other listeners.
 */
export function usePortalLanguage(): [PortalLang, (next: PortalLang) => void] {
  const [lang, setLang] = useState<PortalLang>(() => readStoredLang());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LANG_STORAGE_KEY) setLang(readStoredLang());
    };
    const onCustom = () => setLang(readStoredLang());
    window.addEventListener("storage", onStorage);
    window.addEventListener("timan:lang-change", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("timan:lang-change", onCustom);
    };
  }, []);

  const update = (next: PortalLang) => {
    setLang(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
      window.dispatchEvent(new Event("timan:lang-change"));
    }
  };

  return [lang, update];
}

export interface PortalHeaderUser {
  initials: string;
  name: string;
  role: string;
}

interface PortalHeaderProps {
  /** Display name shown above the role/company text */
  displayName: string;
  /** Company / context line shown under the display name */
  company: string;
  /** Avatar initials block */
  user: PortalHeaderUser;
  /** Optional back link rendered next to the logo */
  backTo?: string;
  /** Override label for the back link */
  backLabel?: string;
  /** Optional module title shown after the back link */
  moduleTitle?: string;
  /** Optional module subtitle shown under the title */
  moduleSubtitle?: string;
}

export function PortalHeader({
  displayName,
  company,
  user,
  backTo,
  backLabel = "Tilbage til dashboard",
  moduleTitle,
  moduleSubtitle,
}: PortalHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [lang, setLang] = usePortalLanguage();

  const handleLogout = async () => {
    await logout();
    toast.success("Du er nu logget ud");
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img
          src={timanLogo}
          alt="Timan Logo"
          className="h-[50px] w-auto md:h-[64px]"
        />
      </div>

      <div className="relative mx-auto grid h-[96px] max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-6 lg:grid-cols-[16rem_minmax(0,1fr)_auto] lg:gap-6">
        <div className="flex min-w-0 items-center justify-start lg:justify-center">
          {backTo ? (
            <Link
              to={backTo as "/dashboard"}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">{backLabel}</span>
            </Link>
          ) : null}
        </div>

        {moduleTitle ? (
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-black leading-tight text-slate-950">
              {moduleTitle}
            </p>
            {moduleSubtitle && (
              <p className="truncate text-xs text-slate-500">
                {moduleSubtitle}
              </p>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center justify-end gap-4 md:gap-6">
          <div className="hidden rounded-full bg-slate-100 p-1 text-sm font-bold text-slate-500 md:flex">
            {PORTAL_LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`rounded-full px-4 py-2 transition-colors ${
                  lang === code
                    ? "bg-white text-slate-950 shadow-sm"
                    : "hover:text-slate-700"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Notifikationer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="h-10 border-l border-slate-200" />

          <div className="hidden text-right sm:block">
            <p className="text-sm font-black">{displayName}</p>
            <p className="text-xs text-slate-500">{company}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-lg font-black text-white">
            {user.initials}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log ud"
            aria-label="Log ud"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
          <img
            src={timanLogo}
            alt="Timan Logo"
            className="h-[50px] w-auto md:h-[64px]"
          />
        </div>

        <div className="flex min-w-0 items-center gap-4">
          {backTo ? (
            <Link
              to={backTo as "/dashboard"}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">{backLabel}</span>
            </Link>
          ) : null}
          {moduleTitle ? (
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-black leading-tight text-slate-950">
                {moduleTitle}
              </p>
              {moduleSubtitle && (
                <p className="truncate text-xs text-slate-500">
                  {moduleSubtitle}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden rounded-full bg-slate-100 p-1 text-sm font-bold text-slate-500 md:flex">
            {PORTAL_LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`rounded-full px-4 py-2 transition-colors ${
                  lang === code
                    ? "bg-white text-slate-950 shadow-sm"
                    : "hover:text-slate-700"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Notifikationer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="h-10 border-l border-slate-200" />

          <div className="hidden text-right sm:block">
            <p className="text-sm font-black">{displayName}</p>
            <p className="text-xs text-slate-500">{company}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-lg font-black text-white">
            {user.initials}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log ud"
            aria-label="Log ud"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
