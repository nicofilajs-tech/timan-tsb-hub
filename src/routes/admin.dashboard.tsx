import { createFileRoute } from "@tanstack/react-router";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Timan Service Portal" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <UnifiedDashboard
      scope="timan_admin"
      displayName="Timan Admin"
      company="Timan Intern"
      user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
    />
  );
}
