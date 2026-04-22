import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Search, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusVariant = "success" | "info" | "warning" | "neutral";
type StatusKey = "udfoert" | "i_gang" | "venter" | "ikke_startet";

const STATUS_OPTIONS: { key: StatusKey; label: string; variant: StatusVariant }[] = [
  { key: "udfoert", label: "Udført", variant: "success" },
  { key: "i_gang", label: "I gang", variant: "info" },
  { key: "venter", label: "Venter på dele", variant: "warning" },
  { key: "ikke_startet", label: "Ikke startet", variant: "neutral" },
];

const statusDotClass: Record<StatusVariant, string> = {
  success: "bg-status-success-fg",
  info: "bg-status-info-fg",
  warning: "bg-status-warning-fg",
  neutral: "bg-status-neutral-fg",
};

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
  status: StatusKey;
  checked: boolean;
}

const initialMachines: Machine[] = [
  {
    serial: "TM-X40-18291",
    model: "X40 Pro",
    customer: "Bygge A/S",
    status: "udfoert",
    checked: true,
  },
  {
    serial: "TM-X40-18432",
    model: "X40 Pro",
    customer: "Entreprenør H. Olsen",
    status: "udfoert",
    checked: true,
  },
  {
    serial: "TM-X40-18501",
    model: "X40 Pro",
    customer: "Kommune Syd",
    status: "i_gang",
    checked: false,
  },
  {
    serial: "TM-X40-18622",
    model: "X40 Standard",
    customer: "Grus & Sand Aps",
    status: "venter",
    checked: false,
  },
  {
    serial: "TM-X40-18733",
    model: "X40 Standard",
    customer: "Landbrug Nord",
    status: "ikke_startet",
    checked: false,
  },
];

function CaseDetailPage() {
  const { id } = Route.useParams();
  const [machines, setMachines] = useState<Machine[]>(initialMachines);

  const updateStatus = (serial: string, status: StatusKey) => {
    setMachines((prev) =>
      prev.map((m) => (m.serial === serial ? { ...m, status } : m)),
    );
  };

  // Auto-derived completion: project is "done" only when ALL machines are "udfoert"
  const totalMachines = machines.length;
  const doneMachines = useMemo(
    () => machines.filter((m) => m.status === "udfoert").length,
    [machines],
  );
  const percent = totalMachines === 0 ? 0 : Math.round((doneMachines / totalMachines) * 100);
  const isComplete = totalMachines > 0 && doneMachines === totalMachines;

  return (
    <ProtectedRoute>
    <AppLayout
      variant="dealer"
      company="Nordic Machinery Aps"
      user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
      breadcrumbs={[{ label: "Mine sager", to: "/cases" }, { label: id }]}
    >
      {/* Header card */}
      <div className="rounded-[10px] border border-border-soft bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusBadge variant="warning">Severity 3</StatusBadge>
              {isComplete ? (
                <StatusBadge variant="success">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Projekt fuldført
                  </span>
                </StatusBadge>
              ) : (
                <StatusBadge variant="info">I gang</StatusBadge>
              )}
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

      {/* Summary cards — auto-computed from machine rows */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Maskiner" value={String(totalMachines)} />
        <div className="rounded-[10px] border border-border-soft bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Udført
          </div>
          <div
            className="mt-2 text-3xl font-semibold"
            style={{ color: "var(--timan-green)" }}
          >
            {doneMachines} af {totalMachines}{" "}
            <span className="text-xl">({percent}%)</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-page-bg">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${percent}%`,
                backgroundColor: "var(--timan-green)",
              }}
            />
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
            {/* "Marker som udført" removed — completion auto-derived from rows */}
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
                    <Checkbox
                      checked={m.status === "udfoert"}
                      onCheckedChange={(checked) =>
                        updateStatus(m.serial, checked ? "udfoert" : "i_gang")
                      }
                    />
                  </td>
                  <td className="px-5 py-4 font-mono text-sm">{m.serial}</td>
                  <td className="px-5 py-4">{m.model}</td>
                  <td className="px-5 py-4 text-muted-foreground">{m.customer}</td>
                  <td className="px-5 py-4">
                    <Select
                      value={m.status}
                      onValueChange={(v) => updateStatus(m.serial, v as StatusKey)}
                    >
                      <SelectTrigger className="h-8 w-[180px] rounded-full border-border-soft bg-page-bg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            <span className="flex items-center gap-2">
                              <span
                                className={cn("h-2 w-2 rounded-full", statusDotClass[opt.variant])}
                              />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
