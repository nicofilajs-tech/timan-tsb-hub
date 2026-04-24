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
        <PortalHeader {...headerProps} backTo={dashboardTo} />

        {/* Page intro */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <h1 className="text-3xl font-black text-slate-950">
              Service / Claims
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Opret og håndter reklamationssager. Kontakt altid Timan og indhent
              et reklamationsnummer før reparationsarbejdet påbegyndes. Brug
              værktøjet nedenfor til at registrere dealer-, ejer- og
              maskininformation, beskrive fejl og reparation samt generere en
              komplet rapport (PDF).
            </p>
          </div>
        </div>

        <ClaimTool />
      </div>
    </ProtectedRoute>
  );
}
