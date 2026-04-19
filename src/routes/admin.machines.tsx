import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/machines")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="Maskiner"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Maskiner" }]}
      />
    </ProtectedRoute>
  ),
});
