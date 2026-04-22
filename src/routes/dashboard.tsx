import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, AlertTriangle, Clock3, CheckCircle2, FolderKanban } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — TSB Portal" }],
  }),
  component: DashboardPage,
});

const recentHighlights = [
  {
    id: "TSB-2026-095",
    title: "Kontrol af bremsekreds",
    status: { variant: "danger" as const, label: "Forsinket" },
    note: "4 dage over deadline",
  },
  {
    id: "TSB-2026-112",
    title: "Udskiftning af hydraulikventil",
    status: { variant: "warning" as const, label: "Afventer accept" },
    note: "Deadline om 3 dage",
  },
  {
    id: "TSB-2026-103",
    title: "Tjek af luftfilter — Z-serie",
    status: { variant: "success" as const, label: "Klar til lukning" },
    note: "5 / 5 maskiner færdige",
  },
];

function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout
        variant="dealer"
        company="Nordic Machinery Aps"
        user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
        breadcrumbs={[{ label: "Dashboard" }]}
      >
        {/* Hero / overview header */}
        <section
          className="rounded-[14px] border border-border-soft p-6 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--timan-green) 8%, white) 0%, white 60%)",
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Oversigt
              </div>
              <h1
                className="mt-1 text-[26px] font-semibold leading-tight"
                style={{ color: "var(--timan-red)" }}
              >
                Velkommen tilbage, Lars
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Her er status på dine åbne TSB'er og maskiner i dag.
              </p>
            </div>
            <Link
              to="/cases"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--timan-green)" }}
            >
              <FolderKanban className="h-4 w-4" />
              Gå til mine sager
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* KPI overview cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Aktive sager" value="4" />
          <StatCard label="Åbne maskiner" value="27" />
          <StatCard label="Nær deadline" value="2" tone="warning" />
          <StatCard label="Forsinket" value="1" tone="danger" />
        </div>

        {/* Two-column summary */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Summary panel */}
          <div className="rounded-[10px] border border-border-soft bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-[16px] font-semibold">Status denne uge</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Et hurtigt overblik over hvor dit team står.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Færdige denne uge"
                value="6"
                tone="success"
              />
              <SummaryRow
                icon={<Clock3 className="h-4 w-4" />}
                label="Igangværende"
                value="3"
                tone="info"
              />
              <SummaryRow
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Kræver handling"
                value="2"
                tone="warning"
              />
            </div>
          </div>

          {/* Recent / important preview */}
          <div className="rounded-[10px] border border-border-soft bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-border-soft p-5">
              <h2 className="text-[16px] font-semibold">Kræver opmærksomhed</h2>
              <Link
                to="/cases"
                className="text-xs font-medium hover:underline"
                style={{ color: "var(--timan-green)" }}
              >
                Se alle
              </Link>
            </div>
            <ul className="divide-y divide-border-soft">
              {recentHighlights.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/cases/$id"
                    params={{ id: r.id }}
                    className="flex items-start justify-between gap-3 p-4 transition-colors hover:bg-page-bg"
                  >
                    <div className="min-w-0">
                      <div
                        className="font-mono text-xs font-semibold"
                        style={{ color: "var(--timan-green)" }}
                      >
                        {r.id}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-medium">{r.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{r.note}</div>
                    </div>
                    <StatusBadge variant={r.status.variant}>{r.status.label}</StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "info" | "warning";
}) {
  const toneStyle: Record<typeof tone, { bg: string; fg: string }> = {
    success: { bg: "var(--status-success-bg)", fg: "var(--status-success-fg)" },
    info: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
    warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  };
  const s = toneStyle[tone];
  return (
    <div className="flex items-center gap-3 rounded-md border border-border-soft p-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-md"
        style={{ backgroundColor: s.bg, color: s.fg }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
