import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Search, CheckCircle2, BellRing } from "lucide-react";
import { toast } from "sonner";
import { PortalHeader } from "@/components/PortalHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DealerCaseStatusBadge } from "@/components/DealerCaseStatusBadge";
import { MachineStatusSelect } from "@/components/MachineStatusSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type DealerCaseStatus,
  type MachineStatus,
} from "@/lib/dealer-status";
import {
  formatDate,
  getMachines,
  setDealerActivation,
  useTsbs,
} from "@/lib/tsb-store";

const CURRENT_DEALER_ID = "d-nordic";

export const Route = createFileRoute("/cases/$id")({
  head: ({ params }) => ({
    meta: [{ title: `${params.id} — TSB Portal` }],
  }),
  component: CaseDetailPage,
});

interface MachineRow {
  serial: string;
  model: string;
  customer: string;
  status: MachineStatus;
}

const initialMachines: MachineRow[] = [
  { serial: "TM-X40-18291", model: "X40 Pro", customer: "Bygge A/S", status: "udfoert" },
  { serial: "TM-X40-18432", model: "X40 Pro", customer: "Entreprenør H. Olsen", status: "udfoert" },
  { serial: "TM-X40-18501", model: "X40 Pro", customer: "Kommune Syd", status: "i_gang" },
  { serial: "TM-X40-18622", model: "X40 Standard", customer: "Grus & Sand Aps", status: "afventer" },
  { serial: "TM-X40-18733", model: "X40 Standard", customer: "Landbrug Nord", status: "afventer" },
];

function CaseDetailPage() {
  const { id } = Route.useParams();
  const tsbs = useTsbs();
  const tsb = tsbs.find((t) => t.id === id);
  const link = tsb?.dealers.find((d) => d.dealerId === CURRENT_DEALER_ID);

  // Derive machine list for this dealer from the shared store.
  const allMachines = getMachines();
  const derivedInitial: MachineRow[] = useMemo(() => {
    if (!link) return initialMachines;
    return link.machineSerials.map((serial) => {
      const m = allMachines.find((x) => x.serial === serial);
      return {
        serial,
        model: m?.model ?? "—",
        customer: m?.customer ?? "—",
        status: "afventer" as MachineStatus,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tsb?.id]);

  const [machines, setMachines] = useState<MachineRow[]>(derivedInitial);

  const updateStatus = (serial: string, status: MachineStatus) => {
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
  const anyWorkStarted = useMemo(
    () => machines.some((m) => m.status !== "afventer"),
    [machines],
  );
  const percent = totalMachines === 0 ? 0 : Math.round((doneMachines / totalMachines) * 100);
  const isComplete = totalMachines > 0 && doneMachines === totalMachines;

  // Overall dealer-case status — separate from machine-level status.
  //   afventer (link.status)  → ny_frigivet
  //   accepteret + no work    → accepteret_info
  //   accepteret + work begun → aktiv
  const caseStatus: DealerCaseStatus =
    link?.status === "accepteret"
      ? anyWorkStarted
        ? "aktiv"
        : "accepteret_info"
      : "ny_frigivet";

  const handleAcceptReceipt = () => {
    if (!tsb) return;
    setDealerActivation(tsb.id, CURRENT_DEALER_ID, "accepteret");
    toast.success("Modtagelse af TSB accepteret");
  };

  const headerTitle = tsb?.title ?? "Softwareopdatering — styreenhed v3.2";
  const headerSeverity = tsb ? `Severity ${tsb.severity}` : "Severity 3";
  const acceptedLabel = link?.acceptedAt
    ? `Accepteret ${formatDate(link.acceptedAt)} af Lars Jensen`
    : "Afventer accept af modtagelse";
  const deadlineLabelText = tsb ? formatDate(tsb.deadline) : "14. maj";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <PortalHeader
          displayName="Lars Jensen"
          company="Nordic Machinery Aps"
          user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
          backTo="/cases"
          backLabel="Tilbage til Mine sager"
          moduleTitle={id}
          moduleSubtitle="TSB-detaljer"
        />
        <main className="mx-auto max-w-7xl px-6 py-6">
      {/* Prominent dealer-case status banner — top of detail page */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border-soft bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {caseStatus === "ny_frigivet" && (
            <BellRing className="h-5 w-5 text-status-warning-fg" />
          )}
          <DealerCaseStatusBadge status={caseStatus} size="md" />
        </div>
        {caseStatus === "ny_frigivet" && tsb && (
          <Button
            onClick={handleAcceptReceipt}
            style={{ backgroundColor: "var(--timan-green)", color: "white" }}
          >
            Accepter modtagelse
          </Button>
        )}
        {isComplete && (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-status-success-fg">
            <CheckCircle2 className="h-4 w-4" />
            Alle maskiner er udført — sagen er klar til lukning
          </span>
        )}
      </div>

      {/* Header card */}
      <div className="rounded-[10px] border border-border-soft bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusBadge variant="warning">{headerSeverity}</StatusBadge>
              <span className="font-mono text-xs text-muted-foreground">{id}</span>
            </div>
            <h1
              className="mt-3 text-[22px] font-semibold"
              style={{ color: "var(--timan-red)" }}
            >
              {headerTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {acceptedLabel}
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
          <div className="mt-2 text-2xl font-semibold">{deadlineLabelText}</div>
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
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
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
                  <td className="px-5 py-4 font-mono text-sm">{m.serial}</td>
                  <td className="px-5 py-4">{m.model}</td>
                  <td className="px-5 py-4 text-muted-foreground">{m.customer}</td>
                  <td className="px-5 py-4">
                    <MachineStatusSelect
                      value={m.status}
                      onChange={(next) => updateStatus(m.serial, next)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
