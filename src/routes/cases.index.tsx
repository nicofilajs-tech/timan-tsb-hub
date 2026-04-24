import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DealerCaseStatusBadge } from "@/components/DealerCaseStatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEALER_CASE_STATUS_LABEL,
  type DealerCaseStatus,
} from "@/lib/dealer-status";
import { daysUntil, deadlineLabel, getTsbsForDealer, useTsbs } from "@/lib/tsb-store";

export const Route = createFileRoute("/cases/")({
  head: () => ({ meta: [{ title: "Mine sager — TSB Portal" }] }),
  component: CasesPage,
});

// Preview/demo: hard-coded dealer identity for the dealer view.
const CURRENT_DEALER_ID = "d-nordic";

const STATUS_FILTERS: { value: "all" | DealerCaseStatus; label: string }[] = [
  { value: "all", label: "Alle statusser" },
  { value: "ny_frigivet", label: DEALER_CASE_STATUS_LABEL.ny_frigivet },
  { value: "accepteret_info", label: DEALER_CASE_STATUS_LABEL.accepteret_info },
  { value: "aktiv", label: DEALER_CASE_STATUS_LABEL.aktiv },
];

type DealerTab =
  | "all"
  | "afventer"
  | "accepterede"
  | "near"
  | "overdue"
  | "lukkede";

const DEALER_TABS: { value: DealerTab; label: string }[] = [
  { value: "all", label: "Mine TSB'er" },
  { value: "afventer", label: "Afventer accept" },
  { value: "accepterede", label: "Accepterede" },
  { value: "near", label: "Nær deadline" },
  { value: "overdue", label: "Overskredet" },
  { value: "lukkede", label: "Lukkede" },
];

function CasesPage() {
  const navigate = useNavigate();
  // Subscribe so that admin activations show up here immediately
  useTsbs();
  const items = getTsbsForDealer(CURRENT_DEALER_ID);
  const [tab, setTab] = useState<DealerTab>("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DealerCaseStatus>("all");

  const matchesDealerTab = (
    tsb: { status: string; deadline: string },
    link: { status: string },
    target: DealerTab,
  ): boolean => {
    if (target === "all") return true;
    if (target === "lukkede") return tsb.status === "lukket";
    if (tsb.status === "lukket") return false; // closed only counted in lukkede
    if (target === "afventer") return link.status !== "accepteret";
    if (target === "accepterede") return link.status === "accepteret";
    const d = daysUntil(tsb.deadline);
    if (target === "overdue") return d < 0;
    if (target === "near") return d >= 0 && d <= 14;
    return true;
  };

  const tabCounts = useMemo(() => {
    const counts: Record<DealerTab, number> = {
      all: items.length,
      afventer: 0,
      accepterede: 0,
      near: 0,
      overdue: 0,
      lukkede: 0,
    };
    for (const { tsb, link } of items) {
      if (matchesDealerTab(tsb, link, "afventer")) counts.afventer++;
      if (matchesDealerTab(tsb, link, "accepterede")) counts.accepterede++;
      if (matchesDealerTab(tsb, link, "near")) counts.near++;
      if (matchesDealerTab(tsb, link, "overdue")) counts.overdue++;
      if (matchesDealerTab(tsb, link, "lukkede")) counts.lukkede++;
    }
    return counts;
  }, [items]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .map(({ tsb, link }) => {
        const dl = deadlineLabel(tsb.deadline);
        // List-level mapping: we only know acceptance state here, not per-machine
        // work state. So:
        //   afventer   → ny_frigivet
        //   accepteret → aktiv (work assumed running once accepted)
        //   afvist     → ny_frigivet (still needs action)
        // The "accepteret_info" intermediate is shown on the detail page once
        // we can see machine state.
        const caseStatus: DealerCaseStatus =
          link.status === "accepteret" ? "aktiv" : "ny_frigivet";
        return { tsb, link, dl, caseStatus };
      })
      .filter((r) => {
        if (!matchesDealerTab(r.tsb, r.link, tab)) return false;
        if (statusFilter !== "all" && r.caseStatus !== statusFilter) return false;
        if (!q) return true;
        return (
          r.tsb.id.toLowerCase().includes(q) ||
          r.tsb.title.toLowerCase().includes(q)
        );
      });
  }, [items, tab, query, statusFilter]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <PortalHeader
          displayName="Lars Jensen"
          company="Nordic Machinery Aps"
          user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
          backTo="/dashboard"
          moduleTitle="Mine TSB-sager"
          moduleSubtitle="Technical Service Bulletins"
        />
        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Den fulde liste over dine TSB-sager. Søg, filtrér og åbn for detaljer.
            </p>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{rows.length}</span> af {items.length} sager
            </div>
          </div>

        {/* Compact role-based tab navigation */}
        <div className="mt-5 flex flex-wrap gap-1 rounded-[10px] border border-border-soft bg-white p-1 shadow-sm">
          {DEALER_TABS.map((t) => {
            const active = tab === t.value;
            const count = tabCounts[t.value];
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-border-soft bg-white p-3 shadow-sm">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Søg på TSB-nummer eller titel..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="whitespace-nowrap">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cases table */}
        <div className="mt-4 rounded-[10px] border border-border-soft bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Nummer</th>
                  <th className="px-5 py-3 font-medium">Titel</th>
                  <th className="px-5 py-3 font-medium">Maskiner</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Ingen sager matcher din søgning.
                    </td>
                  </tr>
                )}
                {rows.map(({ tsb, link, dl, caseStatus }) => (
                  <tr
                    key={tsb.id}
                    onClick={() => navigate({ to: "/cases/$id", params: { id: tsb.id } })}
                    className="cursor-pointer border-b border-border-soft last:border-0 hover:bg-page-bg"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to="/cases/$id"
                        params={{ id: tsb.id }}
                        className="font-mono text-sm font-medium hover:underline"
                        style={{ color: "var(--timan-green)" }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        {tsb.id}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{tsb.title}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {link.machineSerials.length}
                    </td>
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
                      <DealerCaseStatusBadge status={caseStatus} variant="short" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
