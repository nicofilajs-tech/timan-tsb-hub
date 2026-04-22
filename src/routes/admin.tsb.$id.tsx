import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ExternalLink, Check, Send, Building2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  activateTsb,
  daysUntil,
  formatDate,
  getDealer,
  setDealerActivation,
  totalMachineCount,
  useTsbs,
  type DealerActivation,
} from "@/lib/tsb-store";

export const Route = createFileRoute("/admin/tsb/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Timan Admin` }] }),
  component: AdminTsbDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-xl font-semibold">TSB ikke fundet</h1>
      <Link to="/admin/tsb" className="mt-2 inline-block text-sm hover:underline">
        Tilbage til TSB-listen
      </Link>
    </div>
  ),
});

function AdminTsbDetail() {
  const { id } = Route.useParams();
  const tsbs = useTsbs();
  const tsb = tsbs.find((t) => t.id === id);

  const totalMachines = tsb ? totalMachineCount(tsb) : 0;
  const accepted = useMemo(
    () => (tsb ? tsb.dealers.filter((d) => d.status === "accepteret").length : 0),
    [tsb],
  );
  const awaiting = useMemo(
    () => (tsb ? tsb.dealers.filter((d) => d.status === "afventer").length : 0),
    [tsb],
  );

  if (!tsb) {
    return (
      <ProtectedRoute adminOnly>
        <AppLayout
          variant="admin"
          company="Timan Intern"
          user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
          breadcrumbs={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "TSB'er", to: "/admin/tsb" },
            { label: id },
          ]}
        >
          <div className="rounded-[10px] border border-border-soft bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-medium">TSB ikke fundet</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Kontroller TSB-nummeret eller gå tilbage til oversigten.
            </p>
            <Link to="/admin/tsb" className="mt-4 inline-block">
              <Button variant="outline">Tilbage til TSB-listen</Button>
            </Link>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const overdue = daysUntil(tsb.deadline) < 0;
  const isActive = tsb.status === "aktiv";

  const handleActivate = () => {
    activateTsb(tsb.id);
    toast.success(`${tsb.id} er nu aktiv og synlig for forhandlere`);
  };

  const updateDealer = (dealerId: string, status: DealerActivation) => {
    setDealerActivation(tsb.id, dealerId, status);
    toast.success("Status opdateret");
  };

  return (
    <ProtectedRoute adminOnly>
      <AppLayout
        variant="admin"
        company="Timan Intern"
        user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "TSB'er", to: "/admin/tsb" },
          { label: tsb.id },
        ]}
      >
        {/* Header */}
        <div className="rounded-[10px] border border-border-soft bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge variant="warning">Severity {tsb.severity}</StatusBadge>
                {tsb.status === "kladde" && <StatusBadge variant="neutral">Kladde</StatusBadge>}
                {tsb.status === "aktiv" && (
                  <StatusBadge variant={overdue ? "danger" : "success"}>
                    {overdue ? "Forsinket" : "Aktiv"}
                  </StatusBadge>
                )}
                {tsb.status === "lukket" && <StatusBadge variant="info">Lukket</StatusBadge>}
                <span className="font-mono text-xs text-muted-foreground">{tsb.id}</span>
              </div>
              <h1 className="mt-3 text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
                {tsb.title}
              </h1>
              {tsb.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{tsb.description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tsb.documentName && (
                <Button
                  variant="outline"
                  style={{ borderColor: "var(--timan-green)", color: "var(--timan-green)" }}
                >
                  Åbn PDF
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {!isActive ? (
                <Button
                  onClick={handleActivate}
                  style={{ backgroundColor: "var(--timan-green)", color: "white" }}
                >
                  <Send className="h-4 w-4" /> Aktivér TSB
                </Button>
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-status-success-bg px-3 py-2 text-sm font-medium text-status-success-fg">
                  <Check className="h-4 w-4" /> TSB er aktiv
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Forhandlere" value={String(tsb.dealers.length)} />
          <StatCard
            label="Accepteret"
            value={`${accepted} / ${tsb.dealers.length}`}
          />
          <StatCard
            label="Afventer accept"
            value={String(awaiting)}
            tone={awaiting > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Maskiner total"
            value={String(totalMachines)}
          />
        </div>

        {/* Meta grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetaCard label="Aktiv fra" value={formatDate(tsb.activeFrom)} />
          <MetaCard label="Deadline" value={formatDate(tsb.deadline)} />
          <MetaCard label="Oprettet" value={formatDate(tsb.createdAt)} />
        </div>

        {/* Dealer activation table */}
        <div className="mt-6 rounded-[10px] border border-border-soft bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border-soft p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" style={{ color: "var(--timan-green)" }} />
              <h2 className="text-[18px] font-semibold">Forhandlere & accept</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {accepted} accepteret · {awaiting} afventer
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Forhandler</th>
                  <th className="px-5 py-3 font-medium">Kontakt</th>
                  <th className="px-5 py-3 font-medium">Maskiner</th>
                  <th className="px-5 py-3 font-medium">Accepteret</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Handling</th>
                </tr>
              </thead>
              <tbody>
                {tsb.dealers.map((link) => {
                  const dealer = getDealer(link.dealerId);
                  if (!dealer) return null;
                  return (
                    <tr key={link.dealerId} className="border-b border-border-soft last:border-0 hover:bg-page-bg">
                      <td className="px-5 py-4 font-medium">{dealer.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {dealer.contact} · {dealer.city}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {link.machineSerials.length}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {link.acceptedAt ? formatDate(link.acceptedAt) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {link.status === "accepteret" && (
                          <StatusBadge variant="success">Accepteret</StatusBadge>
                        )}
                        {link.status === "afventer" && (
                          <StatusBadge variant="warning">Afventer</StatusBadge>
                        )}
                        {link.status === "afvist" && (
                          <StatusBadge variant="danger">Afvist</StatusBadge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {link.status === "afventer" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDealer(link.dealerId, "accepteret")}
                          >
                            Markér accepteret
                          </Button>
                        )}
                        {link.status === "accepteret" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateDealer(link.dealerId, "afventer")}
                          >
                            Sæt til afventer
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machines list */}
        <div className="mt-6 rounded-[10px] border border-border-soft bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border-soft p-5">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" style={{ color: "var(--timan-green)" }} />
              <h2 className="text-[18px] font-semibold">Berørte maskiner</h2>
            </div>
            <div className="text-sm text-muted-foreground">{totalMachines} i alt</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Serienummer</th>
                  <th className="px-5 py-3 font-medium">Forhandler</th>
                </tr>
              </thead>
              <tbody>
                {tsb.dealers.flatMap((link) => {
                  const dealer = getDealer(link.dealerId);
                  return link.machineSerials.map((serial) => (
                    <tr
                      key={`${link.dealerId}-${serial}`}
                      className="border-b border-border-soft last:border-0 hover:bg-page-bg"
                    >
                      <td className="px-5 py-4 font-mono text-sm">{serial}</td>
                      <td className="px-5 py-4 text-muted-foreground">{dealer?.name ?? "—"}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

function MetaCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-border-soft bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-medium">{value}</div>
    </div>
  );
}
