import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus, FileText, Users, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  daysUntil,
  deadlineLabel,
  getDealer,
  totalMachineCount,
  useTsbs,
} from "@/lib/tsb-store";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Timan TSB" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const tsbs = useTsbs();

  const stats = useMemo(() => {
    const active = tsbs.filter((t) => t.status === "aktiv");
    const awaiting = active.reduce(
      (n, t) => n + t.dealers.filter((d) => d.status === "afventer").length,
      0,
    );
    const nearDeadline = active.filter((t) => {
      const d = daysUntil(t.deadline);
      return d >= 0 && d <= 7;
    }).length;
    const overdue = active.filter((t) => daysUntil(t.deadline) < 0).length;
    return { active: active.length, awaiting, nearDeadline, overdue };
  }, [tsbs]);

  const attention = useMemo(() => {
    return [...tsbs]
      .filter((t) => t.status === "aktiv")
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
      .slice(0, 5);
  }, [tsbs]);

  return (
    <ProtectedRoute adminOnly>
      <AppLayout
        variant="admin"
        company="Timan Intern"
        user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
        breadcrumbs={[{ label: "Dashboard" }]}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overblik over alle TSB-sager på tværs af forhandlere.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/tsb">
              <Button variant="outline">Se alle TSB'er</Button>
            </Link>
            <Link to="/admin/tsb/new">
              <Button style={{ backgroundColor: "var(--timan-green)", color: "white" }}>
                <Plus className="h-4 w-4" /> Ny TSB
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Aktive TSB'er" value={String(stats.active)} />
          <StatCard
            label="Afventer accept"
            value={String(stats.awaiting)}
            tone={stats.awaiting > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Nær deadline"
            value={String(stats.nearDeadline)}
            tone={stats.nearDeadline > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Forsinket"
            value={String(stats.overdue)}
            tone={stats.overdue > 0 ? "danger" : "default"}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <QuickAction
            to="/admin/tsb/new"
            icon={Plus}
            title="Opret ny TSB"
            description="Definer detaljer, vælg forhandlere og maskiner, og aktivér."
          />
          <QuickAction
            to="/admin/tsb"
            icon={FileText}
            title="Administrer TSB'er"
            description="Se status, accept og fremdrift pr. forhandler."
          />
          <QuickAction
            to="/admin/dealers"
            icon={Users}
            title="Forhandlere"
            description="Hold styr på dine forhandlere og kontaktpersoner."
          />
        </div>

        {/* Requires attention */}
        <div className="mt-6 rounded-[10px] border border-border-soft bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border-soft p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" style={{ color: "var(--timan-red)" }} />
              <h2 className="text-[18px] font-semibold">Kræver opmærksomhed</h2>
            </div>
            <Link
              to="/admin/tsb"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--timan-green)" }}
            >
              Se alle <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">TSB</th>
                  <th className="px-5 py-3 font-medium">Titel</th>
                  <th className="px-5 py-3 font-medium">Forhandlere</th>
                  <th className="px-5 py-3 font-medium">Maskiner</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attention.map((t) => {
                  const dl = deadlineLabel(t.deadline);
                  const awaiting = t.dealers.filter((d) => d.status === "afventer").length;
                  return (
                    <tr key={t.id} className="border-b border-border-soft last:border-0 hover:bg-page-bg">
                      <td className="px-5 py-4">
                        <Link
                          to="/admin/tsb/$id"
                          params={{ id: t.id }}
                          className="font-mono text-sm font-medium hover:underline"
                          style={{ color: "var(--timan-green)" }}
                        >
                          {t.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4">{t.title}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {t.dealers.length} ({awaiting} afventer)
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{totalMachineCount(t)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={dl.tone ? "font-medium" : ""}
                          style={
                            dl.tone === "danger"
                              ? { color: "var(--status-danger-fg)" }
                              : dl.tone === "warning"
                              ? { color: "var(--status-warning-fg)" }
                              : undefined
                          }
                        >
                          {dl.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {dl.tone === "danger" ? (
                          <StatusBadge variant="danger">Forsinket</StatusBadge>
                        ) : awaiting > 0 ? (
                          <StatusBadge variant="warning">Afventer accept</StatusBadge>
                        ) : (
                          <StatusBadge variant="success">På sporet</StatusBadge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-[10px] border border-border-soft bg-white p-5 shadow-sm transition-colors hover:bg-page-bg"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md"
          style={{ backgroundColor: "var(--status-success-bg)", color: "var(--timan-green)" }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

// Suppress unused-import warnings for components we may add later
void Clock;
void getDealer;
