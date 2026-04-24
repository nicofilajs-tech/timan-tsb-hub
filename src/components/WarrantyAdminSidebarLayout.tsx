/**
 * Layout for the Timan Admin Warranty Registration module.
 *
 * Mirrors `TsbAdminSidebarLayout` so the visual structure of every admin
 * module is consistent: shared PortalHeader on top + sticky white card
 * sidebar on the left + scrollable content area on the right.
 *
 * Sidebar items: Dashboard, Mine registreringer, Ny registrering,
 * Registrerede garantibeviser.
 */

import type { ReactNode } from "react";
import { Component, useEffect, useState, type ErrorInfo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ClipboardList,
  FileBadge,
  LayoutDashboard,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getPreviewUser, isPreviewAuthBypassEnabled } from "@/lib/preview-auth";
import { isAdminRole, type RoleCode } from "@/lib/auth";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  match: string;
  exact?: boolean;
  /** If true, only dealer roles (non-Timan-admin) can see this item. */
  dealerOnly?: boolean;
}

const NAV: NavItem[] = [
  {
    to: "/admin/warranty/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: "/admin/warranty/dashboard",
  },
  {
    to: "/admin/warranty/mine",
    label: "Mine registreringer",
    icon: ClipboardList,
    match: "/admin/warranty/mine",
  },
  {
    to: "/admin/warranty/new",
    label: "Ny registrering",
    icon: PlusCircle,
    match: "/admin/warranty/new",
    dealerOnly: true,
  },
  {
    to: "/admin/warranty/certificates",
    label: "Registrerede garantibeviser",
    icon: FileBadge,
    match: "/admin/warranty/certificates",
  },
];

function useEffectiveRole(): RoleCode | null {
  const { currentUser } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (currentUser?.role) return currentUser.role;
  if (!hydrated) return null;
  if (isPreviewAuthBypassEnabled()) return getPreviewUser().role;
  return null;
}

interface WarrantyErrorBoundaryState {
  error: Error | null;
}

class WarrantyErrorBoundary extends Component<
  { children: ReactNode },
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
          <h2 className="text-xl font-black">Noget gik galt</h2>
          <p className="mt-2 text-sm">
            Der opstod en fejl ved indlæsning af garantiregistrering. Prøv igen.
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

interface WarrantyAdminSidebarLayoutProps {
  intro?: ReactNode;
  children: ReactNode;
}

export function WarrantyAdminSidebarLayout({
  intro,
  children,
}: WarrantyAdminSidebarLayoutProps) {
  const location = useLocation();
  const role = useEffectiveRole();
  const isTimanAdmin = isAdminRole(role);
  const visibleNav = NAV.filter((n) => !n.dealerOnly || !isTimanAdmin);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        displayName="Timan Admin"
        company="Timan Intern"
        user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
        backTo="/admin/dashboard"
        moduleTitle="Garantiregistrering"
        moduleSubtitle="Warranty Registration"
      />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-[88px] space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.match
                : location.pathname === item.match ||
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
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {intro && <div className="mb-5">{intro}</div>}
          <WarrantyErrorBoundary>{children}</WarrantyErrorBoundary>
        </div>
      </div>
    </div>
  );
}
