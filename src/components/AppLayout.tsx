import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  FileText,
  Building2,
  Wrench,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { BrandHeader } from "./BrandHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppLayoutProps {
  variant: "dealer" | "admin";
  company: string;
  user: { initials: string; name: string; role: string };
  breadcrumbs: { label: string; to?: string }[];
  children: React.ReactNode;
}

const dealerNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Mine sager", icon: FolderKanban },
  { to: "/history", label: "Historik", icon: Clock },
];

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tsb", label: "TSB'er", icon: FileText },
  { to: "/admin/dealers", label: "Forhandlere", icon: Building2 },
  { to: "/admin/machines", label: "Maskiner", icon: Wrench },
  { to: "/admin/users", label: "Brugere", icon: Users },
  { to: "/admin/settings", label: "Indstillinger", icon: Settings },
];

export function AppLayout({ variant, company, user, breadcrumbs, children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const nav = variant === "dealer" ? dealerNav : adminNav;

  const handleLogout = async () => {
    await logout();
    toast.success("Du er nu logget ud");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full bg-page-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border-soft bg-white transition-all duration-200",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-16 items-center border-b border-border-soft px-3">
          {collapsed ? (
            <div className="mx-auto">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-border-soft text-xs font-extrabold italic"
                style={{ color: "var(--timan-red)" }}
              >
                T
              </div>
            </div>
          ) : (
            <BrandHeader subtitle={company} />
          )}
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-status-success-bg text-status-success-fg"
                    : "text-foreground hover:bg-page-bg",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-2 flex items-center justify-center rounded-md border border-border-soft py-2 text-muted-foreground hover:bg-page-bg"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border-soft bg-white px-6">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">/</span>}
                {b.to ? (
                  <Link
                    to={b.to}
                    className="font-medium hover:underline"
                    style={{ color: "var(--timan-green)" }}
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--timan-green)" }}
            >
              {user.initials}
            </div>
            <button
              onClick={handleLogout}
              title="Log ud"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-page-bg hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
