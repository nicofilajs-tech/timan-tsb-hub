import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClaimsAdminSidebarLayout } from "@/components/ClaimsAdminSidebarLayout";
import { ClaimTool } from "@/components/claims/ClaimTool";

export const Route = createFileRoute("/dealer/claims/new")({
  head: () => ({
    meta: [{ title: "Ny claim — Timan Service Portal" }],
  }),
  component: DealerClaimsNewRoute,
});

function DealerClaimsNewRoute() {
  return (
    <ProtectedRoute>
      <ClaimsAdminSidebarLayout
        intro={
          <div>
            <h1 className="text-3xl font-black tracking-tight">Ny claim</h1>
            <p className="mt-1 text-sm text-slate-500">
              Opret en ny reklamationssag.
            </p>
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ClaimTool />
        </div>
      </ClaimsAdminSidebarLayout>
    </ProtectedRoute>
  );
}
