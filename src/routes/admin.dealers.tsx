import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/dealers")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="Forhandlere"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Forhandlere" }]}
      />
    </ProtectedRoute>
  ),
});
