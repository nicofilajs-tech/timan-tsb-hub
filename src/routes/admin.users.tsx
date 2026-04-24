import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TsbAdminSidebarLayout } from "@/components/TsbAdminSidebarLayout";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Brugere — Timan Admin" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <TsbAdminSidebarLayout>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Brugere</h1>
          <p className="mt-1 text-sm text-slate-500">
            Administration af brugere i TSB Portal.
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
