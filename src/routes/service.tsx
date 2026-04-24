import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Page header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <Link
              to={dashboardTo}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbage til dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-black text-slate-950">
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
