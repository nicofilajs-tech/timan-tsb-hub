import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isPreviewAuthBypassEnabled, getPreviewUser } from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/service-info")({
  head: () => ({ meta: [{ title: "Serviceinformation — Timan Service Portal" }] }),
  component: ServiceInfoModule,
});

function ServiceInfoModule() {
  const isAdmin =
    isPreviewAuthBypassEnabled() && isAdminRole(getPreviewUser().role);
  const variant = isAdmin ? "admin" : "dealer";
  const dashboardTo = isAdmin ? "/admin/dashboard" : "/dashboard";
  return (
    <ProtectedRoute>
      <ComingSoonShell
        variant={variant}
        title="Serviceinformation"
        breadcrumbs={[{ label: "Dashboard", to: dashboardTo }, { label: "Serviceinformation" }]}
      />
    </ProtectedRoute>
  );
}
