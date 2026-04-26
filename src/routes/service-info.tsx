import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Phone, Mail, Building2, MapPin } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isPreviewAuthBypassEnabled, getPreviewUser } from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/service-info")({
  head: () => ({ meta: [{ title: "Serviceinformation — Timan Service Portal" }] }),
  component: ServiceInfoModule,
});

function ServiceInfoModule() {
  const { t } = useTranslation();
  const isAdmin =
    isPreviewAuthBypassEnabled() && isAdminRole(getPreviewUser().role);
  const backTo = isAdmin ? "/admin/dashboard" : "/dashboard";
  const displayName = isAdmin ? "Timan Admin" : "Lars Jensen";
  const company = isAdmin ? "Timan Intern" : "Nordic Machinery Aps";
  const user = isAdmin
    ? { initials: "TA", name: "Timan Admin", role: "Intern" }
    : { initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" };

  const moduleTitle = t("dashboard.modulesCard.info.title", "Serviceinformation");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <PortalHeader
          displayName={displayName}
          company={company}
          user={user}
          backTo={backTo}
          moduleTitle={moduleTitle}
          moduleSubtitle={t("dashboard.modulesCard.info.desc", "")}
        />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <p className="mb-8 max-w-2xl text-sm text-slate-600">
            {t("serviceInfo.intro")}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Technical support */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Phone className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-950">
                  {t("serviceInfo.technicalSupport.title")}
                </h2>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("serviceInfo.technicalSupport.phoneLabel")}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="tel:+4596744466"
                      className="text-base font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      96 74 44 66
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("serviceInfo.technicalSupport.emailLabel")}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:service@timan.dk"
                      className="text-base font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      service@timan.dk
                    </a>
                  </dd>
                </div>
              </dl>
            </section>

            {/* Contact us */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-950">
                  {t("serviceInfo.contact.title")}
                </h2>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("serviceInfo.contact.companyLabel")}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-950">
                    Timan A/S
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("serviceInfo.contact.addressLabel")}
                  </dt>
                  <dd className="mt-1 flex items-start gap-2 text-base text-slate-800">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span>Osvald Pedersens Vej 2A-D, 6980 Tim</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("serviceInfo.technicalSupport.emailLabel")}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a
                      href="mailto:service@timan.dk"
                      className="text-base font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      service@timan.dk
                    </a>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
