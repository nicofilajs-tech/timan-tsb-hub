/**
 * Layout for the Timan Admin TSB module.
 *
 * - Reuses the shared PortalHeader (logo, back-to-dashboard, language,
 *   notifications, user, logout).
 * - Adds a compact left-side admin navigation: Dashboard, TSBs,
 *   Dealers, Machines, Users, Settings.
 * - Renders the page content to the right of the sidebar.
 *
 * Used only by Timan Admin TSB pages (`/admin/tsb`). Dealer routes
 * (`/cases`) and Coming-Soon shells use plain PortalHeader without
 * this sidebar so dealers never see admin-only nav items.
 */

import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Globe,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  /** Active when location.pathname starts with this prefix */
  match: string;
  /** If true, only highlight on exact path match (no prefix matching) */
  exact?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/tsb/dashboard", labelKey: "dashboard", icon: LayoutDashboard, match: "/admin/tsb/dashboard" },
  { to: "/admin/tsb", labelKey: "tsbs", icon: FileText, match: "/admin/tsb", exact: true },
  { to: "/admin/dealers", labelKey: "dealers", icon: Building2, match: "/admin/dealers" },
  { to: "/admin/machines", labelKey: "machines", icon: Wrench, match: "/admin/machines" },
  { to: "/admin/users", labelKey: "users", icon: Users, match: "/admin/users" },
  { to: "/admin/countries", labelKey: "countries", icon: Globe, match: "/admin/countries" },
  { to: "/admin/settings", labelKey: "settings", icon: Settings, match: "/admin/settings" },
];

interface TsbAdminSidebarLayoutProps {
  /** Optional intro section above the body (e.g. action row) */
  intro?: ReactNode;
  children: ReactNode;
}

export function TsbAdminSidebarLayout({ intro, children }: TsbAdminSidebarLayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        displayName={t("header.admin")}
        company={t("header.intern")}
        user={{ initials: "TA", name: t("header.admin"), role: t("header.role.intern") }}
        backTo="/admin/dashboard"
        moduleTitle={t("modules.tsb.title")}
        moduleSubtitle={t("modules.tsb.subtitle")}
      />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-6">
        {/* Left side admin navigation */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-[88px] space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.match
                : location.pathname === item.match ||
                  location.pathname.startsWith(item.match + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to as "/admin/dashboard"}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(`sidebar.${item.labelKey}`)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {intro && <div className="mb-5">{intro}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}
