import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isPreviewAuthBypassEnabled, getPreviewUser } from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/manuals")({
  head: () => ({ meta: [{ title: "Brugermanualer — Timan Service Portal" }] }),
  component: ManualsModule,
});

function ManualsModule() {
  const isAdmin =
    isPreviewAuthBypassEnabled() && isAdminRole(getPreviewUser().role);
  const variant = isAdmin ? "admin" : "dealer";
  const dashboardTo = isAdmin ? "/admin/dashboard" : "/dashboard";
  return (
    <ProtectedRoute>
      <ComingSoonShell
        variant={variant}
        title="Brugermanualer"
        breadcrumbs={[{ label: "Dashboard", to: dashboardTo }, { label: "Brugermanualer" }]}
      />
    </ProtectedRoute>
  );
}
