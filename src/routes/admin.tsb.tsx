import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/tsb")({
  component: () => (
    <ProtectedRoute adminOnly>
      <ComingSoonShell
        variant="admin"
        title="TSB'er"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "TSB'er" }]}
      />
    </ProtectedRoute>
  ),
});
