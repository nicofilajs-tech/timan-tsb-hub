import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClaimsAdminSidebarLayout } from "@/components/ClaimsAdminSidebarLayout";
import { ClaimTool } from "@/components/claims/ClaimTool";
import {
  CLAIM_STATUS_LABEL,
  getAllClaims,
  type ClaimRecord,
  type ClaimStatus,
} from "@/lib/claims-store";

export const Route = createFileRoute("/dealer/claims/$claimId")({
  head: ({ params }) => ({
    meta: [
      { title: `Claim ${params.claimId} — Timan Service Portal` },
    ],
  }),
  loader: ({ params }) => {
    const claim = getAllClaims().find((c) => c.id === params.claimId);
    if (!claim) throw notFound();
    return { claim };
  },
  notFoundComponent: () => (
    <ProtectedRoute>
      <ClaimsAdminSidebarLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-black">Claim ikke fundet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Vi kunne ikke finde den efterspurgte sag.
          </p>
          <Link
            to="/dealer/claims/mine"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Tilbage til Mine claims
          </Link>
        </div>
      </ClaimsAdminSidebarLayout>
    </ProtectedRoute>
  ),
  component: DealerClaimDetailRoute,
});

function DealerClaimDetailRoute() {
  const { claim } = Route.useLoaderData();
  return (
    <ProtectedRoute>
      <ClaimsAdminSidebarLayout intro={<DetailIntro claim={claim} />}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ClaimTool />
        </div>
      </ClaimsAdminSidebarLayout>
    </ProtectedRoute>
  );
}

function DetailIntro({ claim }: { claim: ClaimRecord }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <Link
          to="/dealer/claims/mine"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Mine claims
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight">{claim.id}</h1>
          <StatusPill status={claim.status} />
        </div>
        <p className="mt-1 truncate text-sm text-slate-500">
          {claim.title} • {claim.customer} • {claim.machineType} ({claim.serial})
        </p>
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
