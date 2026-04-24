import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  WarrantyDashboardBody,
  WarrantyDashboardIntro,
} from "@/components/warranty/WarrantyDashboardBody";

export const Route = createFileRoute("/admin/warranty/dashboard")({
  head: () => ({
    meta: [{ title: "Garantiregistrering — Dashboard — Timan Service Portal" }],
  }),
  component: WarrantyDashboardRoute,
});

function WarrantyDashboardRoute() {
  return (
    <ProtectedRoute adminOnly>
      <WarrantyAdminSidebarLayout
        scope="admin"
        intro={<WarrantyDashboardIntro scope="admin" />}
      >
        <WarrantyDashboardBody scope="admin" />
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}
