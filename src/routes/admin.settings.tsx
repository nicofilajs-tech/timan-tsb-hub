import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="Indstillinger"
      breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Indstillinger" }]}
    />
  ),
});
