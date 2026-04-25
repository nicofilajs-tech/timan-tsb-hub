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
import {
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  match: string;
}

const DEALER_NAV: NavItem[] = [
  {
    to: "/dealer/claims/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: "/dealer/claims/dashboard",
  },
  {
    to: "/dealer/claims/mine",
    label: "Mine claims",
    icon: ClipboardList,
    match: "/dealer/claims/mine",
  },
];

interface ClaimsErrorBoundaryState {
  error: Error | null;
}

class ClaimsErrorBoundary extends Component<
  { children: ReactNode },
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
          <h2 className="text-xl font-black">Noget gik galt</h2>
          <p className="mt-2 text-sm">
            Der opstod en fejl ved indlæsning af claims-modulet. Prøv igen.
          </p>
          <p className="mt-3 font-mono text-xs opacity-70">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Prøv igen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ClaimsAdminSidebarLayoutProps {
  intro?: ReactNode;
  children: ReactNode;
}

export function ClaimsAdminSidebarLayout({
  intro,
  children,
}: ClaimsAdminSidebarLayoutProps) {
  const location = useLocation();
  const nav = DEALER_NAV;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        displayName="Forhandler"
        company="Service / Claims"
        user={{ initials: "FH", name: "Forhandler", role: "Dealer" }}
        backTo="/dashboard"
        moduleTitle="Service / Claims"
        moduleSubtitle="Officiel portal for forhandlere"
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
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {intro && <div className="mb-5">{intro}</div>}
          <ClaimsErrorBoundary>{children}</ClaimsErrorBoundary>
        </div>
      </div>
    </div>
  );
}
