import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  ClipboardList,
  Factory,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  dealerOverview,
  mostUsedMachineType,
  thisMonthCount,
  totalCount,
  useWarrantyRecords,
} from "@/lib/warranty-store";

export const Route = createFileRoute("/admin/warranty/dashboard")({
  head: () => ({
    meta: [{ title: "Garantiregistrering — Dashboard — Timan Service Portal" }],
  }),
  component: WarrantyDashboardRoute,
});

function WarrantyDashboardRoute() {
  return (
    <ProtectedRoute adminOnly>
      <WarrantyAdminSidebarLayout intro={<Intro />}>
        <DashboardBody />
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}

function Intro() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overblik over garantiregistreringer og forhandleraktivitet.
        </p>
      </div>
      <Link
        to="/admin/warranty/new"
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
      >
        <PlusCircle className="h-4 w-4" /> Ny registrering
      </Link>
    </div>
  );
}

function DashboardBody() {
  const records = useWarrantyRecords();

  const stats = useMemo(() => {
    return {
      total: totalCount(records),
      thisMonth: thisMonthCount(records),
      topMachine: mostUsedMachineType(records),
      latest: records.slice(0, 5),
      dealers: dealerOverview(records).slice(0, 8),
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total registreringer"
          value={stats.total}
          icon={ClipboardList}
          accent="text-indigo-600"
        />
        <Kpi
          label="Denne måned"
          value={stats.thisMonth}
          icon={TrendingUp}
          accent="text-emerald-600"
        />
        <Kpi
          label="Mest brugte maskine"
          value={stats.topMachine.type}
          sub={`${stats.topMachine.count} registreringer`}
          icon={Factory}
          accent="text-amber-600"
        />
        <Kpi
          label="Aktive forhandlere"
          value={stats.dealers.length}
          icon={Factory}
          accent="text-sky-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Latest */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-black">Seneste registreringer</h2>
            <Link
              to="/admin/warranty/mine"
              className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              Se alle <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {stats.latest.length === 0 ? (
            <EmptyState text="Der er endnu ingen garantiregistreringer." />
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.latest.map((r) => (
                <Link
                  key={r.id}
                  to="/admin/warranty/mine"
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-black tracking-widest text-slate-500">
                        {r.certificateNumber}
                      </span>
                      <span className="truncate font-bold">{r.customer}</span>
                    </div>
                    <div className="mt-1 truncate text-sm text-slate-500">
                      {r.machineType} • {r.machineSerial} • {r.dealerName}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-500">
                    <div>{r.deliveryDate || "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dealer overview */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-black">Forhandlere</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Top forhandlere efter antal registreringer
            </p>
          </div>
          {stats.dealers.length === 0 ? (
            <EmptyState text="Ingen forhandleraktivitet endnu." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.dealers.map((d) => (
                <li
                  key={d.dealer}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <span className="truncate font-bold text-slate-700">
                    {d.dealer}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-700">
                    {d.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof ClipboardList;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-6 py-10 text-center text-sm text-slate-500">{text}</div>;
}
