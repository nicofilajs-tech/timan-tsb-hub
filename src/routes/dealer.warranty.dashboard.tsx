import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  WarrantyDashboardBody,
  WarrantyDashboardIntro,
} from "@/components/warranty/WarrantyDashboardBody";
import { useDealerName } from "@/components/warranty/useDealerName";

export const Route = createFileRoute("/dealer/warranty/dashboard")({
  head: () => ({
    meta: [{ title: "Garantiregistrering — Dashboard — Timan Service Portal" }],
  }),
  component: DealerWarrantyDashboardRoute,
});

function DealerWarrantyDashboardRoute() {
  const dealerName = useDealerName();
  return (
    <ProtectedRoute>
      <WarrantyAdminSidebarLayout
        scope="dealer"
        intro={<WarrantyDashboardIntro scope="dealer" />}
      >
        <WarrantyDashboardBody scope="dealer" dealerName={dealerName} />
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}
