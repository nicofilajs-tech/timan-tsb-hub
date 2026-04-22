import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  daysUntil,
  deadlineLabel,
  formatDate,
  totalMachineCount,
  useTsbs,
  type TsbStatus,
} from "@/lib/tsb-store";

export const Route = createFileRoute("/admin/tsb/")({
  head: () => ({ meta: [{ title: "TSB'er — Timan Admin" }] }),
  component: AdminTsbList,
});

const STATUS_FILTERS: { value: "all" | TsbStatus; label: string }[] = [
  { value: "all", label: "Alle statusser" },
  { value: "aktiv", label: "Aktiv" },
  { value: "kladde", label: "Kladde" },
  { value: "lukket", label: "Lukket" },
];

function AdminTsbList() {
  const navigate = useNavigate();
  const tsbs = useTsbs();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TsbStatus>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tsbs.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      return t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q);
    });
  }, [tsbs, query, statusFilter]);

  return (
    <ProtectedRoute adminOnly>
      <AppLayout
        variant="admin"
        company="Timan Intern"
        user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "TSB'er" }]}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
              TSB'er
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Alle Technical Service Bulletins — kladder, aktive og lukkede.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{rows.length}</span> af {tsbs.length}
            </div>
            <Link to="/admin/tsb/new">
              <Button style={{ backgroundColor: "var(--timan-green)", color: "white" }}>
                <Plus className="h-4 w-4" /> Ny TSB
              </Button>
            </Link>
          </div>
        </div>

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
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
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

        <div className="mt-4 rounded-[10px] border border-border-soft bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Nummer</th>
                  <th className="px-5 py-3 font-medium">Titel</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Aktiv fra</th>
                  <th className="px-5 py-3 font-medium">Forhandlere</th>
                  <th className="px-5 py-3 font-medium">Maskiner</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium text-right">Handling</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Ingen TSB'er matcher din søgning.
                    </td>
                  </tr>
                )}
                {rows.map((t) => {
                  const dl = deadlineLabel(t.deadline);
                  const awaiting = t.dealers.filter((d) => d.status === "afventer").length;
                  const overdue = daysUntil(t.deadline) < 0;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigate({ to: "/admin/tsb/$id", params: { id: t.id } })}
                      className="cursor-pointer border-b border-border-soft last:border-0 hover:bg-page-bg"
                    >
                      <td className="px-5 py-4">
                        <Link
                          to="/admin/tsb/$id"
                          params={{ id: t.id }}
                          className="font-mono text-sm font-medium hover:underline"
                          style={{ color: "var(--timan-green)" }}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          {t.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4">{t.title}</td>
                      <td className="px-5 py-4">
                        {t.status === "aktiv" && (
                          <StatusBadge variant={overdue ? "danger" : awaiting > 0 ? "warning" : "success"}>
                            {overdue ? "Forsinket" : awaiting > 0 ? "Afventer accept" : "Aktiv"}
                          </StatusBadge>
                        )}
                        {t.status === "kladde" && <StatusBadge variant="neutral">Kladde</StatusBadge>}
                        {t.status === "lukket" && <StatusBadge variant="info">Lukket</StatusBadge>}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{formatDate(t.activeFrom)}</td>
                      <td className="px-5 py-4 text-muted-foreground">{t.dealers.length}</td>
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
                      <td className="px-5 py-4 text-right">
                        <Link
                          to="/admin/tsb/$id"
                          params={{ id: t.id }}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                          style={{ color: "var(--timan-green)" }}
                        >
                          Åbn <ExternalLink className="h-3 w-3" />
                        </Link>
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
