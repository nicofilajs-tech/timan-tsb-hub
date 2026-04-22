import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deadlineLabel, getTsbsForDealer, useTsbs } from "@/lib/tsb-store";

export const Route = createFileRoute("/cases/")({
  head: () => ({ meta: [{ title: "Mine sager — TSB Portal" }] }),
  component: CasesPage,
});

// Preview/demo: hard-coded dealer identity for the dealer view.
const CURRENT_DEALER_ID = "d-nordic";

type StatusKey = "afventer" | "aktiv" | "forsinket";

const STATUS_FILTERS: { value: "all" | StatusKey; label: string }[] = [
  { value: "all", label: "Alle statusser" },
  { value: "afventer", label: "Afventer accept" },
  { value: "aktiv", label: "Aktiv" },
  { value: "forsinket", label: "Forsinket" },
];

function CasesPage() {
  const navigate = useNavigate();
  // Subscribe so that admin activations show up here immediately
  useTsbs();
  const items = getTsbsForDealer(CURRENT_DEALER_ID);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .map(({ tsb, link }) => {
        const dl = deadlineLabel(tsb.deadline);
        const statusKey: StatusKey =
          dl.tone === "danger"
            ? "forsinket"
            : link.status === "afventer"
            ? "afventer"
            : "aktiv";
        return { tsb, link, dl, statusKey };
      })
      .filter((r) => {
        if (statusFilter !== "all" && r.statusKey !== statusFilter) return false;
        if (!q) return true;
        return (
          r.tsb.id.toLowerCase().includes(q) ||
          r.tsb.title.toLowerCase().includes(q)
        );
      });
  }, [items, query, statusFilter]);

  return (
    <ProtectedRoute>
      <AppLayout
        variant="dealer"
        company="Nordic Machinery Aps"
        user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
        breadcrumbs={[{ label: "Mine sager" }]}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
              Mine sager
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Den fulde liste over dine TSB-sager. Søg, filtrér og åbn for detaljer.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{rows.length}</span> af {items.length} sager
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[10px] border border-border-soft bg-white p-3 shadow-sm">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
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
                {rows.map(({ tsb, link, dl, statusKey }) => (
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
                      {statusKey === "forsinket" ? (
                        <StatusBadge variant="danger">Forsinket</StatusBadge>
                      ) : statusKey === "afventer" ? (
                        <StatusBadge variant="warning">Afventer accept</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">Aktiv</StatusBadge>
                      )}
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
