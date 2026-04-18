import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="Brugere"
      breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Brugere" }]}
    />
  ),
});
