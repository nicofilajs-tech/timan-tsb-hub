/**
 * Timan Service Portal — unified dashboard.
 *
 * Visual layout matches the supplied design reference 1:1:
 *  - Top sticky white header (logo • title • company • bell • user • avatar • logout)
 *  - Welcome hero (red headline, green CTA)
 *  - 4 module cards
 *  - Two KPI panels (TSB / Claim) side-by-side
 *  - "Kræver opmærksomhed" (2/3) + "Seneste aktivitet" (1/3)
 *
 * No sidebar — this is the platform landing page.
 */

import { cloneElement, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Info,
  LogOut,
  Settings,
  Wrench,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
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
  /** Display name shown in welcome heading */
  displayName: string;
  /** Company shown in header */
  company: string;
  /** Header user chip */
  user: { initials: string; name: string; role: string };
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
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Du er nu logget ud");
    navigate({ to: "/login" });
  };

  // Filter TSBs by scope
  const visibleTsbs = useMemo<Tsb[]>(() => {
    if (isAdmin) return tsbs;
    if (!dealerId) return [];
    return tsbs.filter((t) => t.dealers.some((d) => d.dealerId === dealerId));
  }, [tsbs, isAdmin, dealerId]);

  // ---- TSB KPIs ----
  const tsbStats = useMemo(() => {
    const active = visibleTsbs.filter((t) => t.status === "aktiv");

    const awaiting = isAdmin
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

    return { active: active.length, awaiting, nearDeadline, overdue, affectedDealers, affectedMachines };
  }, [visibleTsbs, isAdmin, dealerId]);

  // ---- Claims KPIs (mock — Claim module not yet implemented) ----
  const claimStats = isAdmin
    ? { open: 28, awaiting: 10, inProgress: 12, readyToClose: 4, completed: 156, rejected: 14, avgTime: "4.2 dage" }
    : { open: 4, awaiting: 1, inProgress: 2, readyToClose: 1, completed: 45 };

  // ---- Requires attention ----
  const attention = useMemo(() => {
    const items: Array<{
      kind: "TSB" | "Claim";
      id: string;
      title: string;
      status: string;
      meta: string;
      tone: "danger" | "warning" | "info";
      to: string;
      params?: Record<string, string>;
    }> = [];

    visibleTsbs
      .filter((t) => t.status === "aktiv")
      .forEach((t) => {
        const d = daysUntil(t.deadline);
        const link = !isAdmin ? t.dealers.find((x) => x.dealerId === dealerId) : undefined;
        const to = isAdmin ? "/admin/tsb/$id" : "/cases/$id";
        if (d < 0) {
          items.push({
            kind: "TSB",
            id: t.id,
            title: t.title,
            status: "Forsinket",
            meta: `${Math.abs(d)} dage over deadline`,
            tone: "danger",
            to,
            params: { id: t.id },
          });
        } else if (d <= 7) {
          items.push({
            kind: "TSB",
            id: t.id,
            title: t.title,
            status: "Nær deadline",
            meta: `Deadline om ${d} dage`,
            tone: "info",
            to,
            params: { id: t.id },
          });
        } else if (!isAdmin && link?.status === "afventer") {
          items.push({
            kind: "TSB",
            id: t.id,
            title: t.title,
            status: "Afventer accept",
            meta: "Modtagelse skal bekræftes",
            tone: "warning",
            to,
            params: { id: t.id },
          });
        }
      });

    // Mock claim attention items
    if (isAdmin) {
      items.push({
        kind: "Claim",
        id: "CL-2026-8821",
        title: "Defekt gearkasse - Serie 3400",
        status: "Afventer accept",
        meta: "Svar ønskes i dag",
        tone: "warning",
        to: "/service",
      });
      items.push({
        kind: "Claim",
        id: "CL-2026-8790",
        title: "Manglende dokumentation på reklamation",
        status: "Kræver handling",
        meta: "Senest opdateret for 6 dage siden",
        tone: "danger",
        to: "/service",
      });
    } else {
      items.push({
        kind: "Claim",
        id: "CL-2026-0051",
        title: "Reklamation — startmotor",
        status: "Afventer accept",
        meta: "Modtaget i går",
        tone: "warning",
        to: "/service",
      });
    }

    const order = { danger: 0, warning: 1, info: 2 } as const;
    return items.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 4);
  }, [visibleTsbs, isAdmin, dealerId]);

  // ---- Recent activity (mock) ----
  const recentActivity = isAdmin
    ? [
        { text: "Ny reklamation oprettet: CL-2026-8901", time: "10 min siden" },
        { text: "TSB-2026-103 blev accepteret", time: "2 timer siden" },
        { text: "Ny serviceinformation publiceret", time: "5 timer siden" },
        { text: "Claim CL-2026-8750 ændret til under behandling", time: "I går" },
      ]
    : [
        { text: "Ny reklamation oprettet: CL-2026-0051", time: "12 min siden" },
        { text: "TSB-2026-108 blev accepteret", time: "I går" },
        { text: "Claim CL-2026-0044 opdateret til 'I gang'", time: "2 dage siden" },
        { text: "Ny serviceinformation publiceret", time: "3 dage siden" },
      ];

  const firstName = displayName.split(" ")[0];

  return (
    <ProtectedRoute adminOnly={isAdmin}>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top header */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <img
                src="https://timan.dk/wp-content/uploads/2021/04/timan-logo.png"
                alt="Timan"
                className="h-8"
              />
              <div className="border-l border-slate-200 pl-4">
                <p className="text-lg font-bold leading-none">Service Portal</p>
                <p className="text-xs text-slate-500">{company}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100">
                <Bell size={20} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
              </button>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                {user.initials}
              </div>

              <button
                onClick={handleLogout}
                title="Log ud"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
          {/* Welcome hero */}
          <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-700">
                Oversigt
              </p>
              <h1 className="text-3xl font-black text-red-600">
                Velkommen til Timan Service Portal, {firstName}
              </h1>
              <p className="mt-2 text-slate-500">
                Her er samlet status på TSB'er, reklamationer og serviceopgaver.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={isAdmin ? "/admin/tsb" : "/cases"}
                className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition-colors hover:bg-green-800"
              >
                Gå til mine sager <ChevronRight size={18} />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition-colors hover:bg-slate-800"
                >
                  System Administration <Settings size={18} />
                </Link>
              )}
            </div>
          </section>

          {/* Module cards */}
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ModuleCard
              title="Service / Claims"
              desc="Opret og følg reklamationer, garantisager og servicehistorik."
              icon={<Wrench />}
              to="/service"
              color="green"
            />
            <ModuleCard
              title="TSB Portal"
              desc="Se Technical Service Bulletins, deadlines, accept og status."
              icon={<FileText />}
              to={isAdmin ? "/admin/tsb" : "/cases"}
              color="blue"
            />
            <ModuleCard
              title="Brugermanualer"
              desc="Find manualer, dokumentation og tekniske filer."
              icon={<BookOpen />}
              to="/manuals"
              color="amber"
            />
            <ModuleCard
              title="Serviceinformation"
              desc="Læs vigtige servicemeddelelser, kendte fejl og løsninger."
              icon={<Info />}
              to="/service-info"
              color="purple"
            />
          </section>

          {/* KPI panels */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <KPIPanel
              title="TSB KPI Oversigt"
              icon={<BarChart3 size={20} />}
              accent="text-blue-600"
              items={[
                ["Aktive TSB'er", tsbStats.active, "text-slate-900"],
                ["Afventer accept", tsbStats.awaiting, "text-amber-600"],
                ["Nær deadline", tsbStats.nearDeadline, "text-blue-600"],
                ["Forsinkede", tsbStats.overdue, "text-red-600"],
                ...(isAdmin
                  ? ([["Berørte forhandlere", tsbStats.affectedDealers, "text-slate-900"]] as KPIItem[])
                  : []),
                ["Berørte maskiner", tsbStats.affectedMachines, "text-slate-900"],
              ]}
            />

            <KPIPanel
              title="Reklamations KPI"
              icon={<Wrench size={20} />}
              accent="text-green-600"
              items={[
                ["Åbne claims", claimStats.open, "text-slate-900"],
                ["Afventer accept", claimStats.awaiting, "text-amber-600"],
                ["Under behandling", claimStats.inProgress, "text-blue-600"],
                ["Klar til lukning", claimStats.readyToClose, "text-green-600"],
                ...(isAdmin && "rejected" in claimStats
                  ? ([
                      ["Afviste", claimStats.rejected, "text-red-600"],
                      ["Gns. behandlingstid", claimStats.avgTime, "text-slate-900"],
                    ] as KPIItem[])
                  : ([["Afsluttede", claimStats.completed, "text-slate-500"]] as KPIItem[])),
              ]}
            />
          </section>

          {/* Attention + Activity */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Kræver opmærksomhed */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <SectionHeader
                title="Kræver opmærksomhed"
                icon={<AlertCircle className="text-red-500" />}
                action="Se alle"
              />

              {attention.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  Intet kræver opmærksomhed lige nu.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attention.map((item) => {
                    const tone = TONE[item.tone];
                    return (
                      <Link
                        key={`${item.kind}-${item.id}`}
                        to={item.to as "/admin/tsb/$id"}
                        params={(item.params ?? {}) as { id: string }}
                        className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-2 ${tone.bg} ${tone.text}`}>
                            {item.kind === "TSB" ? <FileText size={18} /> : <Wrench size={18} />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {item.id}
                              </span>
                              <p className="font-bold text-slate-800">{item.title}</p>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className={`rounded-full px-2 py-1 font-bold ${tone.bg} ${tone.text}`}>
                                {item.status}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock size={12} /> {item.meta}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-400" size={20} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seneste aktivitet */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Seneste aktivitet"
                icon={<Clock className="text-slate-400" />}
                action="Historik"
              />

              <div className="space-y-5 p-5">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.text}</p>
                      <p className="mt-1 text-xs text-slate-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-4 text-center">
                <button className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800">
                  Vis fuld historik <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ---------------- Helpers ----------------

type KPIItem = [string, string | number, string];

const TONE = {
  danger: { bg: "bg-red-50", text: "text-red-700" },
  warning: { bg: "bg-amber-50", text: "text-amber-700" },
  info: { bg: "bg-blue-50", text: "text-blue-700" },
} as const;

function ModuleCard({
  title,
  desc,
  icon,
  to,
  color,
}: {
  title: string;
  desc: string;
  icon: React.ReactElement<{ size?: number }>;
  to: string;
  color: "green" | "blue" | "amber" | "purple";
}) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <Link
      to={to as "/service"}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${colors[color]}`}
      >
        {cloneElement(icon, { size: 24 })}
      </div>

      <h2 className="mb-2 text-xl font-black text-slate-900">{title}</h2>
      <p className="mb-5 text-sm leading-relaxed text-slate-500">{desc}</p>

      <div className="flex items-center gap-1 text-sm font-bold text-green-700">
        Åbn modul{" "}
        <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function KPIPanel({
  title,
  icon,
  accent,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  items: KPIItem[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
        <h2 className="flex items-center gap-2 font-black uppercase tracking-wide text-slate-700">
          <span className={accent}>{icon}</span>
          {title}
        </h2>
        <span className="text-xs text-slate-400">Live oversigt</span>
      </div>

      <div className="grid grid-cols-2 gap-5 p-5 md:grid-cols-3">
        {items.map(([label, value, color]) => (
          <div key={label}>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {label}
            </p>
            <p className={`text-3xl font-black ${color} whitespace-nowrap`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon: React.ReactElement<{ size?: number }>;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-5">
      <h2 className="flex items-center gap-2 text-lg font-black">
        {cloneElement(icon, { size: 22 })}
        {title}
      </h2>
      <button className="text-sm font-bold text-green-700 hover:underline">{action}</button>
    </div>
  );
}
