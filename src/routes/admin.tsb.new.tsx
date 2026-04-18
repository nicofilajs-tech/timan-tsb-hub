import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/tsb/new")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="Ny TSB"
      breadcrumbs={[
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "TSB'er", to: "/admin/tsb" },
        { label: "Ny" },
      ]}
    />
  ),
});
