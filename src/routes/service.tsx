import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PortalHeader } from "@/components/PortalHeader";

import { ClaimTool } from "@/components/claims/ClaimTool";
import { isPreviewAuthBypassEnabled, getPreviewUser } from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [{ title: "Service / Claims — Timan Service Portal" }],
  }),
  component: ServiceModule,
});

function ServiceModule() {
  const isAdmin =
    isPreviewAuthBypassEnabled() && isAdminRole(getPreviewUser().role);
  const dashboardTo = isAdmin ? "/admin/dashboard" : "/dashboard";

  // Header context — mirrors what the dashboard passes in.
  const headerProps = isAdmin
    ? {
        displayName: "Timan Admin",
        company: "Timan Intern",
        user: { initials: "TA", name: "Timan Admin", role: "Intern" },
      }
    : {
        displayName: "Forhandler",
        company: "Dealer",
        user: { initials: "FH", name: "Forhandler", role: "Dealer" },
      };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <PortalHeader
          {...headerProps}
          backTo={dashboardTo}
          moduleTitle="Service / Claims"
          moduleSubtitle="Officiel portal for forhandlere"
        />

        <ClaimTool />
      </div>
    </ProtectedRoute>
  );
}
