import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="Brugere"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Brugere" }]}
      />
    </ProtectedRoute>
  ),
});
