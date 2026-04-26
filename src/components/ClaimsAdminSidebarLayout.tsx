/**
 * Layout for the Dealer Claims portal — mirrors WarrantyAdminSidebarLayout.
 * Used by /dealer/claims/{dashboard,mine,new}.
 *
 * One shared shell: PortalHeader + sticky white card sidebar + content area
 * with an ErrorBoundary around the children.
 */

import type { ReactNode } from "react";
import { Component, type ErrorInfo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";

export type ClaimsLayoutScope = "admin" | "dealer";

interface NavItem {
  to: string;
  /** i18n key under "sidebar.*" */
  labelKey: string;
  icon: LucideIcon;
  match: string;
}

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/claims/dashboard", labelKey: "dashboard", icon: LayoutDashboard, match: "/admin/claims/dashboard" },
  { to: "/admin/claims/all", labelKey: "allClaims", icon: ClipboardList, match: "/admin/claims/all" },
];

const DEALER_NAV: NavItem[] = [
  { to: "/dealer/claims/dashboard", labelKey: "dashboard", icon: LayoutDashboard, match: "/dealer/claims/dashboard" },
  { to: "/dealer/claims/mine", labelKey: "myClaims", icon: ClipboardList, match: "/dealer/claims/mine" },
];

interface ClaimsErrorBoundaryState {
  error: Error | null;
}

class ClaimsErrorBoundaryInner extends Component<
  { children: ReactNode; tErrorTitle: string; tErrorBody: string; tRetry: string },
  ClaimsErrorBoundaryState
> {
  state: ClaimsErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ClaimsErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ClaimsErrorBoundary]", error, info);
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

interface ClaimsAdminSidebarLayoutProps {
  /** Defaults to "dealer" so the existing dealer routes keep working. */
  scope?: ClaimsLayoutScope;
  intro?: ReactNode;
  children: ReactNode;
}

export function ClaimsAdminSidebarLayout({
  scope = "dealer",
  intro,
  children,
}: ClaimsAdminSidebarLayoutProps) {
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
          company: t("modules.claims.title"),
          user: { initials: "FH", name: t("header.dealer"), role: t("header.role.dealer") },
          backTo: "/dashboard",
        };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        {...headerProps}
        moduleTitle={t("modules.claims.title")}
        moduleSubtitle={t("modules.claims.subtitle")}
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
                  to={item.to as "/dealer/claims/dashboard"}
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
          <ClaimsErrorBoundaryInner
            tErrorTitle={t("modules.claims.errorTitle")}
            tErrorBody={t("modules.claims.errorBody")}
            tRetry={t("modules.claims.retry")}
          >
            {children}
          </ClaimsErrorBoundaryInner>
        </div>
      </div>
    </div>
  );
}
