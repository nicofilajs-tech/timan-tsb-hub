/**
 * Layout for the Warranty Registration module — used by BOTH:
 *  - Timan Admin (scope="admin"):  /admin/warranty/{dashboard,certificates}
 *  - Dealer Admin (scope="dealer"): /dealer/warranty/{dashboard,registrations,new}
 *
 * One shared shell: PortalHeader + sticky white card sidebar + content area.
 * The sidebar items, labels, header titles and link targets switch by `scope`.
 */

import type { ReactNode } from "react";
import { Component, type ErrorInfo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  FileBadge,
  LayoutDashboard,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";

export type WarrantyLayoutScope = "admin" | "dealer";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  match: string;
}

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/warranty/dashboard", labelKey: "dashboard", icon: LayoutDashboard, match: "/admin/warranty/dashboard" },
  { to: "/admin/warranty/certificates", labelKey: "registeredCertificates", icon: FileBadge, match: "/admin/warranty/certificates" },
];

const DEALER_NAV: NavItem[] = [
  { to: "/dealer/warranty/dashboard", labelKey: "dashboard", icon: LayoutDashboard, match: "/dealer/warranty/dashboard" },
  { to: "/dealer/warranty/registrations", labelKey: "myRegistrations", icon: ClipboardList, match: "/dealer/warranty/registrations" },
  { to: "/dealer/warranty/new", labelKey: "newRegistration", icon: PlusCircle, match: "/dealer/warranty/new" },
];

interface WarrantyErrorBoundaryState {
  error: Error | null;
}

class WarrantyErrorBoundaryInner extends Component<
  { children: ReactNode; tErrorTitle: string; tErrorBody: string; tRetry: string },
  WarrantyErrorBoundaryState
> {
  state: WarrantyErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): WarrantyErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[WarrantyErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-900">
          <h2 className="text-xl font-black">{this.props.tErrorTitle}</h2>
          <p className="mt-2 text-sm">{this.props.tErrorBody}</p>
          <p className="mt-3 font-mono text-xs opacity-70">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            {this.props.tRetry}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface WarrantyAdminSidebarLayoutProps {
  /** Defaults to "admin" so existing Timan Admin routes keep working. */
  scope?: WarrantyLayoutScope;
  intro?: ReactNode;
  children: ReactNode;
}

export function WarrantyAdminSidebarLayout({
  scope = "admin",
  intro,
  children,
}: WarrantyAdminSidebarLayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const nav = scope === "admin" ? ADMIN_NAV : DEALER_NAV;

  const headerProps =
    scope === "admin"
      ? {
          displayName: t("header.admin"),
          company: t("header.intern"),
          user: { initials: "TA", name: t("header.admin"), role: t("header.role.intern") },
          backTo: "/admin/dashboard",
        }
      : {
          displayName: t("header.dealer"),
          company: t("modules.warranty.title"),
          user: { initials: "FH", name: t("header.dealer"), role: t("header.role.dealer") },
          backTo: "/dashboard",
        };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        {...headerProps}
        moduleTitle={t("modules.warranty.title")}
        moduleSubtitle={t("modules.warranty.subtitle")}
      />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-[88px] space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {nav.map((item) => {
              const Icon = item.icon;
              const active =
                location.pathname === item.match ||
                location.pathname.startsWith(item.match + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to as "/admin/warranty/dashboard"}
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

        <div className="min-w-0 flex-1">
          {intro && <div className="mb-5">{intro}</div>}
          <WarrantyErrorBoundaryInner
            tErrorTitle={t("modules.warranty.errorTitle")}
            tErrorBody={t("modules.warranty.errorBody")}
            tRetry={t("modules.warranty.retry")}
          >
            {children}
          </WarrantyErrorBoundaryInner>
        </div>
      </div>
    </div>
  );
}
