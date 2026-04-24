/**
 * Timan Service Portal — unified dashboard.
 *
 * Visual layout matches `lovable-ready-dashboard-reference.tsx` 1:1:
 *  - Sticky white top header (logo • lang switcher • bell • user • avatar • logout)
 *  - Dark navy hero with grid background + "Velkommen til Timan Service Portal"
 *  - 4 module cards overlapping the hero (-mt-14)
 *  - Two KPI panels side-by-side (TSB / Reklamations)
 *  - "Kræver opmærksomhed" (2/3) + "Seneste aktivitet" timeline (1/3)
 */

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Info,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PortalHeader } from "@/components/PortalHeader";
import {
  daysUntil,
  totalMachineCount,
  useTsbs,
  type Tsb,
} from "@/lib/tsb-store";

type DashboardScope = "timan_admin" | "dealer";

interface UnifiedDashboardProps {
  scope: DashboardScope;
  /** Dealer scope only — limit data to this dealer's company */
  dealerId?: string;
  /** Display name shown in header */
  displayName: string;
  /** Company shown in header */
  company: string;
  /** Header user chip */
  user: { initials: string; name: string; role: string };
}

type ColorKey = "green" | "blue" | "amber" | "purple" | "red";

const badgeColors: Record<ColorKey, { soft: string; text: string; border: string }> = {
  green: { soft: "bg-green-50", text: "text-green-700", border: "border-green-100" },
  blue: { soft: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  amber: { soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  purple: { soft: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  red: { soft: "bg-red-50", text: "text-red-700", border: "border-red-100" },
};

interface ModuleCardItem {
  title: string;
  desc: string;
  action: string;
  href: string;
  color: ColorKey;
  icon: LucideIcon;
}

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface UrgentItem {
  type: "TSB" | "Claim";
  id: string;
  title: string;
  status: string;
  deadline: string;
  icon: LucideIcon;
  color: ColorKey;
  href: string;
  params?: Record<string, string>;
}

export function UnifiedDashboard({
  scope,
  dealerId,
  displayName,
  company,
  user,
}: UnifiedDashboardProps) {
  const isAdmin = scope === "timan_admin";
  const tsbs = useTsbs();

  // Filter TSBs by scope
  const visibleTsbs = useMemo<Tsb[]>(() => {
    if (isAdmin) return tsbs;
    if (!dealerId) return [];
    return tsbs.filter((t) => t.dealers.some((d) => d.dealerId === dealerId));
  }, [tsbs, isAdmin, dealerId]);

  // ---- TSB KPIs ----
  const tsbStats = useMemo(() => {
    const active = visibleTsbs.filter((t) => t.status === "aktiv");

    const waiting = isAdmin
      ? active.reduce(
          (n, t) => n + t.dealers.filter((d) => d.status === "afventer").length,
          0,
        )
      : active.filter((t) =>
          t.dealers.some((d) => d.dealerId === dealerId && d.status === "afventer"),
        ).length;

    const nearDeadline = active.filter((t) => {
      const d = daysUntil(t.deadline);
      return d >= 0 && d <= 7;
    }).length;

    const overdue = active.filter((t) => daysUntil(t.deadline) < 0).length;

    const affectedDealers = isAdmin
      ? new Set(active.flatMap((t) => t.dealers.map((d) => d.dealerId))).size
      : 0;

    const affectedMachines = isAdmin
      ? active.reduce((n, t) => n + totalMachineCount(t), 0)
      : active.reduce((n, t) => {
          const link = t.dealers.find((d) => d.dealerId === dealerId);
          return n + (link?.machineSerials.length ?? 0);
        }, 0);

    return {
      active: active.length,
      waiting,
      nearDeadline,
      overdue,
      affectedDealers,
      affectedMachines,
    };
  }, [visibleTsbs, isAdmin, dealerId]);

  // ---- Claims KPIs (mock — Claim module not yet implemented) ----
  const claimStats = isAdmin
    ? { open: 28, waiting: 10, inProgress: 12, readyToClose: 4, completed: 156, rejected: 14, avgTime: "4.2 dage" }
    : { open: 4, waiting: 1, inProgress: 2, readyToClose: 1, completed: 45 };

  const modules: ModuleCardItem[] = [
    {
      title: "Service / Claims",
      desc: "Opret og håndter reklamationssager, følg status og se historik på maskiner.",
      action: "Åbn reklamationer",
      href: "/service",
      color: "green",
      icon: Wrench,
    },
    {
      title: "TSB Portal",
      desc: "Tekniske Service Bulletins. Se påkrævede opdateringer og sikkerhedstjek.",
      action: "Gå til TSB",
      href: isAdmin ? "/admin/tsb" : "/cases",
      color: "blue",
      icon: FileText,
    },
    {
      title: "Brugermanualer",
      desc: "Komplet bibliotek med brugervejledninger, reservedelskataloger og tekniske tegninger.",
      action: "Åbn bibliotek",
      href: "/manuals",
      color: "amber",
      icon: BookOpen,
    },
    {
      title: "Serviceinformation",
      desc: "Nyheder, tips og tricks samt generel information om vedligeholdelse af Timan produkter.",
      action: "Se information",
      href: "/service-info",
      color: "purple",
      icon: Info,
    },
  ];

  const tsbKpis: StatItem[] = [
    { label: "Aktive TSB", value: tsbStats.active },
    { label: "Afventer accept", value: tsbStats.waiting, color: "text-amber-600" },
    { label: "Nær deadline", value: tsbStats.nearDeadline, color: "text-indigo-600" },
    { label: "Forsinket", value: tsbStats.overdue, color: "text-red-600" },
    ...(isAdmin
      ? [{ label: "Berørte forhandlere", value: tsbStats.affectedDealers, color: "text-amber-600" }]
      : []),
    { label: "Berørte maskiner", value: tsbStats.affectedMachines },
  ];

  const claimKpis: StatItem[] = [
    { label: "Åbne claims", value: claimStats.open },
    { label: "Afventer accept", value: claimStats.waiting, color: "text-amber-600" },
    { label: "I gang", value: claimStats.inProgress, color: "text-indigo-600" },
    { label: "Klar til lukning", value: claimStats.readyToClose, color: "text-green-600" },
    { label: "Afsluttede", value: claimStats.completed },
    ...(isAdmin && "rejected" in claimStats
      ? [
          { label: "Afviste", value: claimStats.rejected as number, color: "text-red-600" },
          { label: "Gennemsnitlig behandlingstid", value: (claimStats as { avgTime: string }).avgTime },
        ]
      : []),
  ];

  // ---- Requires attention ----
  const urgentItems = useMemo<UrgentItem[]>(() => {
    const items: UrgentItem[] = [];

    visibleTsbs
      .filter((t) => t.status === "aktiv")
      .forEach((t) => {
        const d = daysUntil(t.deadline);
        const link = !isAdmin ? t.dealers.find((x) => x.dealerId === dealerId) : undefined;
        const href = isAdmin ? "/admin/tsb/$id" : "/cases/$id";
        if (d < 0) {
          items.push({
            type: "TSB",
            id: t.id,
            title: t.title,
            status: "Forsinket",
            deadline: `Deadline: ${Math.abs(d)} dage siden`,
            icon: FileText,
            color: "red",
            href,
            params: { id: t.id },
          });
        } else if (d <= 7) {
          items.push({
            type: "TSB",
            id: t.id,
            title: t.title,
            status: "Nær deadline",
            deadline: `Deadline: Om ${d} dage`,
            icon: FileText,
            color: "blue",
            href,
            params: { id: t.id },
          });
        } else if (!isAdmin && link?.status === "afventer") {
          items.push({
            type: "TSB",
            id: t.id,
            title: t.title,
            status: "Afventer accept",
            deadline: "Modtagelse skal bekræftes",
            icon: FileText,
            color: "amber",
            href,
            params: { id: t.id },
          });
        }
      });

    if (isAdmin) {
      items.push({
        type: "Claim",
        id: "CL-8821",
        title: "Defekt gearkasse - Serie 3400",
        status: "Afventer accept",
        deadline: "Deadline: I dag",
        icon: Wrench,
        color: "amber",
        href: "/service",
      });
      items.push({
        type: "Claim",
        id: "CL-8790",
        title: "Elektronik fejl i display",
        status: "Manglende dokumentation",
        deadline: "Deadline: I går",
        icon: Wrench,
        color: "red",
        href: "/service",
      });
    } else {
      items.push({
        type: "Claim",
        id: "CL-0051",
        title: "Reklamation — startmotor",
        status: "Afventer accept",
        deadline: "Modtaget i går",
        icon: Wrench,
        color: "amber",
        href: "/service",
      });
    }

    const order: Record<ColorKey, number> = { red: 0, amber: 1, blue: 2, purple: 3, green: 4 };
    return items.sort((a, b) => order[a.color] - order[b.color]).slice(0, 4);
  }, [visibleTsbs, isAdmin, dealerId]);

  // ---- Recent activity (mock) ----
  const recentActivity = isAdmin
    ? [
        { text: "Ny reklamation oprettet (CL-8901)", time: "10 min siden" },
        { text: "TSB-2023-112 blev lukket af Forhandler A", time: "2 timer siden" },
        { text: "Ny Service Information: Vedligehold af feje-sugeanlæg", time: "5 timer siden" },
        { text: 'Reklamation CL-8750 ændret status til "I arbejde"', time: "I går" },
      ]
    : [
        { text: "Ny reklamation oprettet (CL-0051)", time: "12 min siden" },
        { text: "TSB-2026-108 blev accepteret", time: "I går" },
        { text: 'Reklamation CL-0044 ændret status til "I gang"', time: "2 dage siden" },
        { text: "Ny Service Information publiceret", time: "3 dage siden" },
      ];

  return (
    <ProtectedRoute adminOnly={isAdmin}>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <PortalHeader displayName={displayName} company={company} user={user} />

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-slate-950 px-6 pb-32 pt-20 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:132px_84px]" />
            <div className="absolute right-0 top-0 h-72 w-1/2 rounded-full border border-white/20 opacity-40" />

            <div className="relative mx-auto max-w-7xl">
              <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
                Velkommen til Timan Service Portal
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-200">
                Din centrale adgang til servicehåndtering, TSB-oversigt og teknisk dokumentation.
                Her kan du nemt administrere sager, se KPI'er og få adgang til de nyeste ressourcer.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to={isAdmin ? "/admin/tsb" : "/cases"}
                  className="inline-flex items-center gap-3 rounded-lg bg-green-600 px-7 py-4 font-black text-white transition-colors hover:bg-green-700"
                >
                  Gå til mine sager <ChevronRight className="h-5 w-5" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/tsb"
                    className="inline-flex items-center gap-3 rounded-lg border border-white/30 bg-white/10 px-7 py-4 font-black text-white transition-colors hover:bg-white/15"
                  >
                    Administrer TSB'er
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Module cards (overlap hero) */}
          <section className="relative mx-auto -mt-14 grid max-w-7xl grid-cols-1 gap-7 px-6 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((card) => (
              <ModuleCard key={card.title} card={card} />
            ))}
          </section>

          {/* KPI panels */}
          <section className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-8 px-6 xl:grid-cols-2">
            <KpiPanel title="TSB KPI Oversigt" icon={BarChart3} items={tsbKpis} meta="Opdateret nu" />
            <KpiPanel title="Reklamations KPI" icon={Wrench} items={claimKpis} meta="Sidste 30 dage" />
          </section>

          {/* Attention + Activity */}
          <section className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-8 px-6 pb-24 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <PanelHeader title="Kræver opmærksomhed" icon={AlertCircle} action="Se alle" />
              <div className="divide-y divide-slate-100">
                {urgentItems.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">
                    Intet kræver opmærksomhed lige nu.
                  </div>
                ) : (
                  urgentItems.map((item) => {
                    const Icon = item.icon;
                    const c = badgeColors[item.color];
                    return (
                      <Link
                        key={`${item.type}-${item.id}`}
                        to={item.href as "/admin/tsb/$id"}
                        params={(item.params ?? {}) as { id: string }}
                        className="flex items-center justify-between gap-5 p-5 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-xl p-3 ${c.soft} ${c.text}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black tracking-widest text-slate-400">
                                {item.id}
                              </span>
                              <p className="font-black">{item.title}</p>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.soft} ${c.text}`}>
                                {item.status}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-4 w-4" /> {item.deadline}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <PanelHeader title="Seneste aktivitet" icon={Clock} />
              <div className="p-6">
                <div className="space-y-8 border-l border-slate-200 pl-6">
                  {recentActivity.map((item) => (
                    <div key={item.text} className="relative">
                      <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-green-600 bg-white" />
                      <p className="font-bold">{item.text}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 bg-slate-50 p-5 text-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 font-black text-slate-500 transition-colors hover:text-slate-900"
                >
                  Vis fuld historik <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ---------------- Sub-components ----------------

function ModuleCard({ card }: { card: ModuleCardItem }) {
  const Icon = card.icon;
  const colors = badgeColors[card.color];

  return (
    <Link
      to={card.href as "/service"}
      className={`group rounded-2xl border bg-white p-9 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl ${colors.border}`}
    >
      <div
        className={`mb-8 flex h-14 w-14 items-center justify-center rounded-xl ${colors.soft} ${colors.text}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-black">{card.title}</h2>
      <p className="mt-5 min-h-24 leading-relaxed text-slate-500">{card.desc}</p>
      <div className="mt-7 inline-flex items-center gap-2 font-black text-green-700">
        {card.action}{" "}
        <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function KpiPanel({
  title,
  icon: Icon,
  items,
  meta,
}: {
  title: string;
  icon: LucideIcon;
  items: StatItem[];
  meta: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <h2 className="flex items-center gap-3 text-xl font-black uppercase tracking-wide text-slate-700">
          <Icon className="h-6 w-6 text-indigo-600" />
          {title}
        </h2>
        <span className="text-sm font-bold text-slate-400">{meta}</span>
      </div>
      <div className="grid grid-cols-2 gap-8 p-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              {item.label}
            </p>
            <p className={`mt-3 text-3xl font-black ${item.color || "text-slate-950"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon: LucideIcon;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-6">
      <h2 className="flex items-center gap-3 text-2xl font-black">
        <Icon className="h-6 w-6 text-red-500" />
        {title}
      </h2>
      {action && (
        <button type="button" className="font-black text-green-700 hover:underline">
          {action}
        </button>
      )}
    </div>
  );
}
