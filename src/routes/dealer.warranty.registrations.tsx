import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  WarrantyRegistrationsHeader,
  WarrantyRegistrationsTable,
} from "@/components/warranty/WarrantyRegistrationsTable";
import { useDealerName } from "@/components/warranty/useDealerName";

export const Route = createFileRoute("/dealer/warranty/registrations")({
  head: () => ({
    meta: [{ title: "Mine registreringer — Garantiregistrering — Timan Service Portal" }],
  }),
  component: DealerRegistrationsRoute,
});

function DealerRegistrationsRoute() {
  const dealerName = useDealerName();
  return (
    <ProtectedRoute>
      <WarrantyAdminSidebarLayout
        scope="dealer"
        intro={
          <WarrantyRegistrationsHeader
            scope="dealer"
            title="Mine registreringer"
            subtitle="Søg og filtrér i dine garantiregistreringer."
          />
        }
      >
        <WarrantyRegistrationsTable scope="dealer" dealerName={dealerName} />
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}
