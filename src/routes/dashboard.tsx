import { createFileRoute } from "@tanstack/react-router";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Timan Service Portal" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <UnifiedDashboard
      scope="dealer"
      dealerId="d-nordic"
      displayName="Lars"
      company="Nordic Machinery Aps"
      user={{ initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }}
    />
  );
}
