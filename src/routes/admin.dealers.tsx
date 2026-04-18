import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/dealers")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="Forhandlere"
      breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Forhandlere" }]}
    />
  ),
});
