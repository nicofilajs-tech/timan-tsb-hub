import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/history")({
  component: () => (
    <ComingSoonShell
      variant="dealer"
      title="Historik"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Historik" }]}
    />
  ),
});
