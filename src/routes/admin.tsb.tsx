import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/tsb")({
  component: () => (
    <ComingSoonShell
      variant="admin"
      title="TSB'er"
      breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "TSB'er" }]}
    />
  ),
});
