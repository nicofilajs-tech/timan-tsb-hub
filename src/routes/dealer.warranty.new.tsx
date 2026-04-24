import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  WarrantyNewForm,
  WarrantyNewFormIntro,
} from "@/components/warranty/WarrantyNewForm";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/auth";
import { getPreviewUser, isPreviewAuthBypassEnabled } from "@/lib/preview-auth";
import { useDealerName } from "@/components/warranty/useDealerName";

export const Route = createFileRoute("/dealer/warranty/new")({
  head: () => ({
    meta: [{ title: "Ny registrering — Garantiregistrering — Timan Service Portal" }],
  }),
  component: DealerNewRegistrationRoute,
});

function DealerNewRegistrationRoute() {
  return (
    <ProtectedRoute>
      <WarrantyAdminSidebarLayout scope="dealer" intro={<WarrantyNewFormIntro />}>
        <DealerOnlyGate>
          <DealerForm />
        </DealerOnlyGate>
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}

function DealerForm() {
  const dealerName = useDealerName();
  return <WarrantyNewForm defaultDealerName={dealerName} />;
}

/** Block Timan admins from the dealer-only registration form. */
function DealerOnlyGate({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const role =
    currentUser?.role ??
    (hydrated && isPreviewAuthBypassEnabled() ? getPreviewUser().role : null);
  const isTimanAdmin = isAdminRole(role);

  useEffect(() => {
    if (hydrated && isTimanAdmin) {
      navigate({ to: "/admin/warranty/dashboard" });
    }
  }, [hydrated, isTimanAdmin, navigate]);

  if (!hydrated) return null;
  if (isTimanAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Ny registrering kan kun oprettes af forhandlere. Omdirigerer …
      </div>
    );
  }
  return <>{children}</>;
}
