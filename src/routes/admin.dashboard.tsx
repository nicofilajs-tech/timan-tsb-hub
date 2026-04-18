import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="Admin Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    />
  ),
});
