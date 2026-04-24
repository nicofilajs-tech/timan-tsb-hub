import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TsbAdminSidebarLayout } from "@/components/TsbAdminSidebarLayout";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Indstillinger — Timan Admin" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <ProtectedRoute adminOnly>
      <TsbAdminSidebarLayout>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Indstillinger</h1>
          <p className="mt-1 text-sm text-slate-500">
            Konfiguration af TSB Portal.
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Denne side er endnu ikke implementeret. Kommer snart.
          </p>
        </div>
      </TsbAdminSidebarLayout>
    </ProtectedRoute>
  );
}
