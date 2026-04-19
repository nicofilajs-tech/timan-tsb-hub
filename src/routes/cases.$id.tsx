import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/cases/$id")({
  head: ({ params }) => ({
    meta: [{ title: `${params.id} — TSB Portal` }],
  }),
  component: CaseDetailPage,
});

interface Machine {
  serial: string;
  model: string;
  customer: string;
  status: { variant: "success" | "info" | "warning" | "neutral"; label: string };
  checked: boolean;
}

const machines: Machine[] = [
  {
    serial: "TM-X40-18291",
    model: "X40 Pro",
    customer: "Bygge A/S",
    status: { variant: "success", label: "Udført" },
    checked: true,
  },
  {
    serial: "TM-X40-18432",
    model: "X40 Pro",
    customer: "Entreprenør H. Olsen",
    status: { variant: "success", label: "Udført" },
    checked: true,
  },
  {
    serial: "TM-X40-18501",
    model: "X40 Pro",
    customer: "Kommune Syd",
    status: { variant: "info", label: "I gang" },
    checked: false,
  },
  {
    serial: "TM-X40-18622",
    model: "X40 Standard",
    customer: "Grus & Sand Aps",
    status: { variant: "warning", label: "Venter på dele" },
    checked: false,
  },
  {
    serial: "TM-X40-18733",
    model: "X40 Standard",
    customer: "Landbrug Nord",
    status: { variant: "neutral", label: "Ikke startet" },
    checked: false,
  },
];

function CaseDetailPage() {
  const { id } = Route.useParams();

  return (
    <ProtectedRoute>
    <AppLayout
      variant="dealer"
      company="Nordic Machinery Aps"
      user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: id }]}
    >
      {/* Header card */}
      <div className="rounded-[10px] border border-border-soft bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusBadge variant="warning">Severity 3</StatusBadge>
              <span className="font-mono text-xs text-muted-foreground">{id} · v1.1</span>
            </div>
            <h1
              className="mt-3 text-[22px] font-semibold"
              style={{ color: "var(--timan-red)" }}
            >
              Softwareopdatering — styreenhed v3.2
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Accepteret 12. marts 2026 af Lars Jensen
            </p>
          </div>
          <Button
            variant="outline"
            style={{ borderColor: "var(--timan-green)", color: "var(--timan-green)" }}
          >
            Åbn PDF (dansk)
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Maskiner" value="12" />
        <div className="rounded-[10px] border border-border-soft bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Udført
          </div>
          <div
            className="mt-2 text-3xl font-semibold"
            style={{ color: "var(--timan-green)" }}
          >
            7 af 12 <span className="text-xl">(58%)</span>
          </div>
        </div>
        <div className="rounded-[10px] border border-border-soft bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Deadline
          </div>
          <div className="mt-2 text-3xl font-semibold">
            14. maj <span className="text-base font-normal text-muted-foreground">(27 dage)</span>
          </div>
        </div>
      </div>

      {/* Machines */}
      <div className="mt-6 rounded-[10px] border border-border-soft bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border-soft p-5">
          <h2 className="text-[18px] font-semibold">Maskiner</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Søg..." className="pl-9" />
            </div>
            <Button>Marker som udført</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium w-10"></th>
                <th className="px-5 py-3 font-medium">Serienummer</th>
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Kunde</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr
                  key={m.serial}
                  className="border-b border-border-soft last:border-0 hover:bg-page-bg"
                >
                  <td className="px-5 py-4">
                    <Checkbox defaultChecked={m.checked} disabled={m.checked} />
                  </td>
                  <td className="px-5 py-4 font-mono text-sm">{m.serial}</td>
                  <td className="px-5 py-4">{m.model}</td>
                  <td className="px-5 py-4 text-muted-foreground">{m.customer}</td>
                  <td className="px-5 py-4">
                    <StatusBadge variant={m.status.variant}>{m.status.label}</StatusBadge>
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
