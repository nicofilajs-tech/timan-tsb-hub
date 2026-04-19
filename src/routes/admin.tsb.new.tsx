import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/tsb/new")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="Ny TSB"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "TSB'er", to: "/admin/tsb" },
          { label: "Ny" },
        ]}
      />
    </ProtectedRoute>
  ),
});
