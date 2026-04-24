import { PortalHeader } from "./PortalHeader";

interface ComingSoonProps {
  variant: "dealer" | "admin";
  title: string;
  /**
   * Breadcrumbs are accepted for backwards compatibility with existing
   * route files but are intentionally not rendered — the new shared
   * portal header replaces the old breadcrumb/sidebar chrome.
   */
  breadcrumbs?: { label: string; to?: string }[];
}

export function ComingSoonShell({ variant, title }: ComingSoonProps) {
  const isDealer = variant === "dealer";
  const backTo = isDealer ? "/dashboard" : "/admin/dashboard";
  const displayName = isDealer ? "Lars Jensen" : "Timan Admin";
  const company = isDealer ? "Nordic Machinery Aps" : "Timan Intern";
  const user = isDealer
    ? { initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }
    : { initials: "TA", name: "Timan Admin", role: "Intern" };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalHeader
        displayName={displayName}
        company={company}
        user={user}
        backTo={backTo}
        moduleTitle={title}
        moduleSubtitle="Kommer snart"
      />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">{title}</h1>
          <p className="mt-3 text-sm text-slate-500">
            Denne side er endnu ikke implementeret. Kommer snart.
          </p>
        </div>
      </main>
    </div>
  );
}
