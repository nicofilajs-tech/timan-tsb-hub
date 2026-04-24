import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isPreviewAuthBypassEnabled, getPreviewUser } from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/service")({
  head: () => ({ meta: [{ title: "Service / Claims — Timan Service Portal" }] }),
  component: ServiceModule,
});

function ServiceModule() {
  // Pick layout variant based on the active preview role so sidebar matches.
  const isAdmin =
    isPreviewAuthBypassEnabled() && isAdminRole(getPreviewUser().role);
  const variant = isAdmin ? "admin" : "dealer";
  const dashboardTo = isAdmin ? "/admin/dashboard" : "/dashboard";
  return (
    <ProtectedRoute>
      <ComingSoonShell
        variant={variant}
        title="Service / Claims"
        breadcrumbs={[{ label: "Dashboard", to: dashboardTo }, { label: "Service / Claims" }]}
      />
    </ProtectedRoute>
  );
}
