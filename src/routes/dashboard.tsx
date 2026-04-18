import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — TSB Portal" }],
  }),
  component: DashboardPage,
});

interface Row {
  id: string;
  title: string;
  machines: number;
  total: number;
  deadline: string;
  deadlineTone?: "warning" | "danger";
  status: { variant: "warning" | "success" | "danger"; label: string };
}

const rows: Row[] = [
  {
    id: "TSB-2026-112",
    title: "Udskiftning af hydraulikventil",
    machines: 0,
    total: 8,
    deadline: "3 dage",
    deadlineTone: "warning",
    status: { variant: "warning", label: "Afventer accept" },
  },
  {
    id: "TSB-2026-108",
    title: "Softwareopdatering styreenhed",
    machines: 7,
    total: 12,
    deadline: "27 dage",
    status: { variant: "success", label: "I gang" },
  },
  {
    id: "TSB-2026-103",
    title: "Tjek af luftfilter — Z-serie",
    machines: 5,
    total: 5,
    deadline: "—",
    status: { variant: "success", label: "Klar til lukning" },
  },
  {
    id: "TSB-2026-095",
    title: "Kontrol af bremsekreds",
    machines: 0,
    total: 3,
    deadline: "4 dage over",
    deadlineTone: "danger",
    status: { variant: "danger", label: "Forsinket" },
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  return (
    <AppLayout
      variant="dealer"
      company="Nordic Machinery Aps"
      user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
        Dashboard
      </h1>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aktive sager" value="4" />
        <StatCard label="Åbne maskiner" value="27" />
        <StatCard label="Nær deadline" value="2" tone="warning" />
        <StatCard label="Forsinket" value="1" tone="danger" />
      </div>

      <div className="mt-6 rounded-[10px] border border-border-soft bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border-soft p-5">
          <h2 className="text-[18px] font-semibold">Dine TSB'er</h2>
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Søg..." className="pl-9" />
          </div>
        </div>
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
                      style={
                        r.deadlineTone === "warning"
                          ? { color: "#B45309", fontWeight: 500 }
                          : r.deadlineTone === "danger"
                          ? { color: "#991B1B", fontWeight: 500 }
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
  );
}
