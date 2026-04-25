import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClaimsAdminSidebarLayout } from "@/components/ClaimsAdminSidebarLayout";
import {
  CLAIM_STATUS_LABEL,
  formatDkk,
  getAllClaims,
  type ClaimStatus,
} from "@/lib/claims-store";

export const Route = createFileRoute("/admin/claims/dashboard")({
  head: () => ({
    meta: [{ title: "Claims — Dashboard — Timan Service Portal" }],
  }),
  component: AdminClaimsDashboardRoute,
});

const ACTIVE_STATUSES: ClaimStatus[] = ["waiting", "in_progress", "approved"];

function AdminClaimsDashboardRoute() {
  return (
    <ProtectedRoute adminOnly>
      <ClaimsAdminSidebarLayout scope="admin" intro={<DashboardIntro />}>
        <DashboardBody />
      </ClaimsAdminSidebarLayout>
    </ProtectedRoute>
  );
}

function DashboardIntro() {
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Aktuelle claims på tværs af forhandlere — kun aktive sager.
      </p>
    </div>
  );
}

function DashboardBody() {
  const active = useMemo(() => {
    return [...getAllClaims()]
      .filter((r) => ACTIVE_STATUSES.includes(r.status))
      .sort((a, b) => b.damageDate.localeCompare(a.damageDate))
      .slice(0, 8);
  }, []);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
            Aktuelle claims
          </div>
          <Link
            to="/admin/claims/all"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Se alle claims
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {active.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Ingen aktive claims i øjeblikket.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-3">Claim nr.</th>
                  <th className="px-6 py-3">Garantinr.</th>
                  <th className="px-6 py-3">Forhandler</th>
                  <th className="px-6 py-3">Land</th>
                  <th className="px-6 py-3">Skadedato</th>
                  <th className="px-6 py-3">Godkendt dato</th>
                  <th className="px-6 py-3 text-right">Samlet pris</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs font-black text-slate-700">
                      {r.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-slate-600">
                      {r.warrantyNo}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      {r.dealer}
                    </td>
                    <td className="px-6 py-3">{r.country}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-600">
                      {r.damageDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-600">
                      {r.approvedDate ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right font-mono text-xs">
                      {formatDkk(r.totalPrice)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
