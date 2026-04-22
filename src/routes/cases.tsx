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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [{ title: "Mine sager — TSB Portal" }],
  }),
  component: CasesPage,
});

type StatusKey = "afventer" | "i_gang" | "klar" | "forsinket";

interface Row {
  id: string;
  title: string;
  machines: number;
  total: number;
  deadline: string;
  deadlineTone?: "warning" | "danger";
  status: { key: StatusKey; variant: "warning" | "success" | "danger"; label: string };
}

const allRows: Row[] = [
  {
    id: "TSB-2026-112",
    title: "Udskiftning af hydraulikventil",
    machines: 0,
    total: 8,
    deadline: "3 dage",
    deadlineTone: "warning",
    status: { key: "afventer", variant: "warning", label: "Afventer accept" },
  },
  {
    id: "TSB-2026-108",
    title: "Softwareopdatering styreenhed",
    machines: 7,
    total: 12,
    deadline: "27 dage",
    status: { key: "i_gang", variant: "success", label: "I gang" },
  },
  {
    id: "TSB-2026-103",
    title: "Tjek af luftfilter — Z-serie",
    machines: 5,
    total: 5,
    deadline: "—",
    status: { key: "klar", variant: "success", label: "Klar til lukning" },
  },
  {
    id: "TSB-2026-095",
    title: "Kontrol af bremsekreds",
    machines: 0,
    total: 3,
    deadline: "4 dage over",
    deadlineTone: "danger",
    status: { key: "forsinket", variant: "danger", label: "Forsinket" },
  },
];

const STATUS_FILTERS: { value: "all" | StatusKey; label: string }[] = [
  { value: "all", label: "Alle statusser" },
  { value: "afventer", label: "Afventer accept" },
  { value: "i_gang", label: "I gang" },
  { value: "klar", label: "Klar til lukning" },
  { value: "forsinket", label: "Forsinket" },
];

function CasesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((r) => {
      if (statusFilter !== "all" && r.status.key !== statusFilter) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

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
            <span className="font-semibold text-foreground">{rows.length}</span> af {allRows.length} sager
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
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate({ to: "/cases/$id", params: { id: r.id } })}
                    className="cursor-pointer border-b border-border-soft last:border-0 hover:bg-page-bg"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to="/cases/$id"
                        params={{ id: r.id }}
                        className="font-mono text-sm font-medium hover:underline"
                        style={{ color: "var(--timan-green)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.id}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{r.title}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {r.machines} / {r.total}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          r.deadlineTone === "warning" && "font-medium",
                          r.deadlineTone === "danger" && "font-medium",
                        )}
                        style={
                          r.deadlineTone === "warning"
                            ? { color: "#B45309" }
                            : r.deadlineTone === "danger"
                            ? { color: "#991B1B" }
                            : undefined
                        }
                      >
                        {r.deadline}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge variant={r.status.variant}>{r.status.label}</StatusBadge>
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
