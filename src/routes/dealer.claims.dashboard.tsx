import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Pencil,
  PlusCircle,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClaimsAdminSidebarLayout } from "@/components/ClaimsAdminSidebarLayout";
import { useDealerName } from "@/components/warranty/useDealerName";
import {
  CLAIM_STATUS_LABEL,
  getDealerClaims,
  isClaimEditable,
  summarizeDealerClaims,
  type ClaimStatus,
} from "@/lib/claims-store";

export const Route = createFileRoute("/dealer/claims/dashboard")({
  head: () => ({
    meta: [{ title: "Claims — Dashboard — Timan Service Portal" }],
  }),
  component: DealerClaimsDashboardRoute,
});

function DealerClaimsDashboardRoute() {
  const dealerName = useDealerName();
  return (
    <ProtectedRoute>
      <ClaimsAdminSidebarLayout intro={<DashboardIntro />}>
        <DashboardBody dealerName={dealerName} />
      </ClaimsAdminSidebarLayout>
    </ProtectedRoute>
  );
}

function DashboardIntro() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overblik over dine reklamationssager.
        </p>
      </div>
      <Link
        to="/dealer/claims/new"
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
      >
        <PlusCircle className="h-4 w-4" /> Ny claim
      </Link>
    </div>
  );
}

function DashboardBody({ dealerName }: { dealerName: string }) {
  const records = useMemo(() => getDealerClaims(dealerName), [dealerName]);
  const stats = useMemo(() => summarizeDealerClaims(records), [records]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Mine claims i alt"
          value={stats.total}
          icon={ClipboardList}
          accent="text-indigo-600"
        />
        <Kpi
          label="Åbne claims"
          value={stats.open}
          icon={Wrench}
          accent="text-amber-600"
        />
        <Kpi
          label="Godkendte"
          value={stats.approved}
          icon={CheckCircle2}
          accent="text-emerald-600"
        />
        <Kpi
          label="Afviste"
          value={stats.rejected}
          icon={XCircle}
          accent="text-red-600"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-black">Seneste claims</h2>
          <Link
            to="/dealer/claims/mine"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            Se alle
          </Link>
        </div>
        {stats.latest.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Du har endnu ingen claims.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.latest.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-black tracking-widest text-slate-500">
                      {r.id}
                    </span>
                    <span className="truncate font-bold">{r.title}</span>
                  </div>
                  <div className="mt-1 truncate text-sm text-slate-500">
                    {r.customer} • {r.machineType} • {r.serial}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <StatusPill status={r.status} />
                  <div className="mt-1 text-xs text-slate-500">
                    {r.createdAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: ClaimStatus }) {
  const cls: Record<ClaimStatus, string> = {
    open: "bg-blue-50 text-blue-700",
    waiting: "bg-amber-50 text-amber-700",
    in_progress: "bg-indigo-50 text-indigo-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    closed: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black ${cls[status]}`}
    >
      {CLAIM_STATUS_LABEL[status]}
    </span>
  );
}
