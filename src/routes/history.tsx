import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/history")({
  component: () => (
    <ProtectedRoute>
      <ComingSoonShell
        variant="dealer"
        title="Historik"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Historik" }]}
      />
    </ProtectedRoute>
  ),
});
