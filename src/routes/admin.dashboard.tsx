import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="Admin Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
      />
    </ProtectedRoute>
  ),
});
