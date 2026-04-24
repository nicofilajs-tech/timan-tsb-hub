import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  WarrantyRegistrationsHeader,
  WarrantyRegistrationsTable,
} from "@/components/warranty/WarrantyRegistrationsTable";

export const Route = createFileRoute("/admin/warranty/certificates")({
  head: () => ({
    meta: [
      {
        title:
          "Registrerede garantibeviser — Garantiregistrering — Timan Service Portal",
      },
    ],
  }),
  component: CertificatesRoute,
});

function CertificatesRoute() {
  return (
    <ProtectedRoute adminOnly>
      <WarrantyAdminSidebarLayout
        scope="admin"
        intro={
          <WarrantyRegistrationsHeader
            scope="admin"
            title="Registrerede garantibeviser"
            subtitle="Alle udstedte garantibeviser fra alle forhandlere. Klik på en række for at se eller downloade."
          />
        }
      >
        <WarrantyRegistrationsTable
          scope="admin"
          title="Registrerede garantibeviser"
          showCertificateActions
        />
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}
