import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="Indstillinger"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Indstillinger" }]}
      />
    </ProtectedRoute>
  ),
});
