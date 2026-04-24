import type { ReactNode } from "react";
import { PortalHeader } from "@/components/PortalHeader";
import { PageBackLink } from "@/components/PageBackLink";

interface TsbAdminLayoutProps {
  /** Optional intro section (h1, description, primary actions) */
  intro?: ReactNode;
  children: ReactNode;
}

/**
 * Consistent shell for /admin/tsb/* pages: shared portal header, a back
 * link to the dashboard, optional page intro, and the page body.
 */
export function TsbAdminLayout({ intro, children }: TsbAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        displayName="Timan Admin"
        company="Timan Intern"
        user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <PageBackLink to="/admin/dashboard" />
          {intro && <div className="mt-3">{intro}</div>}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
