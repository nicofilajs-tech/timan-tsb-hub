import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/machines")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="Maskiner"
      breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Maskiner" }]}
    />
  ),
});
