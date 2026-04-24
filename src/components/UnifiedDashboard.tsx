import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Wrench,
  BookOpen,
  Info,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  daysUntil,
  deadlineLabel,
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
  /** Company shown in sidebar header */
  company: string;
  /** Sidebar user chip */
  user: { initials: string; name: string; role: string };
}

/**
 * Single shared dashboard used as the post-login landing page for ALL roles.
 *
 * - Timan Admin: global data across all dealers / machines.
 * - Dealer Admin / Dealer User: data scoped to their own company (dealerId).
 *
 * Layout, visual hierarchy and module structure are identical across roles —
 * only the numbers and "scope label" differ.
 */
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

    return {
      active: active.length,
      awaiting,
      nearDeadline,
      overdue,
      affectedDealers,
      affectedMachines,
    };
  }, [visibleTsbs, isAdmin, dealerId]);

  // ---- Claims KPIs (mock — Claim module not yet implemented) ----
  const claimStats = isAdmin
    ? {
        open: 12,
        awaiting: 3,
        inProgress: 5,
        readyToClose: 2,
        completed: 41,
        rejected: 4,
        avgHandlingDays: 6.2,
      }
    : {
        open: 2,
        awaiting: 1,
        inProgress: 1,
        readyToClose: 0,
        completed: 7,
      };

  // ---- Requires attention ----
  const attention = useMemo(() => {
    const items: Array<{
      kind: "tsb" | "claim";
      id: string;
      title: string;
      tone: "danger" | "warning" | "info";
      badge: string;
      meta: string;
      href: { to: string; params?: Record<string, string> };
    }> = [];

    visibleTsbs
      .filter((t) => t.status === "aktiv")
      .forEach((t) => {
        const days = daysUntil(t.deadline);
        const dealerLink = !isAdmin
          ? t.dealers.find((d) => d.dealerId === dealerId)
          : undefined;
        if (days < 0) {
          items.push({
            kind: "tsb",
            id: t.id,
            title: t.title,
            tone: "danger",
            badge: "Forsinket",
            meta: `${Math.abs(days)} dage over deadline`,
            href: isAdmin
              ? { to: "/admin/tsb/$id", params: { id: t.id } }
              : { to: "/cases/$id", params: { id: t.id } },
          });
        } else if (days <= 7) {
          items.push({
            kind: "tsb",
            id: t.id,
            title: t.title,
            tone: "warning",
            badge: "Nær deadline",
            meta: `Deadline om ${days} dage`,
            href: isAdmin
              ? { to: "/admin/tsb/$id", params: { id: t.id } }
              : { to: "/cases/$id", params: { id: t.id } },
          });
        } else if (!isAdmin && dealerLink?.status === "afventer") {
          items.push({
            kind: "tsb",
            id: t.id,
            title: t.title,
            tone: "warning",
            badge: "Afventer accept",
            meta: "Modtagelse skal bekræftes",
            href: { to: "/cases/$id", params: { id: t.id } },
          });
        }
      });

    // Mock claim attention items so the section is realistic.
    if (isAdmin) {
      items.push({
        kind: "claim",
        id: "CLM-2026-0042",
        title: "Garanticlaim — hydraulikpumpe",
        tone: "warning",
        badge: "Afventer accept",
        meta: "Modtaget for 2 dage siden",
        href: { to: "/service" },
      });
      items.push({
        kind: "claim",
        id: "CLM-2026-0039",
        title: "Manglende dokumentation",
        tone: "danger",
        badge: "Mangler bilag",
        meta: "Ingen aktivitet i 7 dage",
        href: { to: "/service" },
      });
    } else {
      items.push({
        kind: "claim",
        id: "CLM-2026-0051",
        title: "Reklamation — startmotor",
        tone: "warning",
        badge: "Afventer accept",
        meta: "Modtaget i går",
        href: { to: "/service" },
      });
    }

    // Sort: danger first, then warning, then info
    const order = { danger: 0, warning: 1, info: 2 };
    return items.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 6);
  }, [visibleTsbs, isAdmin, dealerId]);

  // ---- Recent activity (mock) ----
  const recentActivity = isAdmin
    ? [
        { icon: FileText, text: "Ny claim oprettet — CLM-2026-0052", time: "5 min siden" },
        { icon: CheckCircle2, text: "TSB-2026-103 accepteret af Jysk Maskincenter", time: "27 min siden" },
        { icon: Wrench, text: "Claim CLM-2026-0048 sat til 'Klar til lukning'", time: "1 t siden" },
        { icon: ClipboardList, text: "Serviceinformation 'Smøreplan Z-serie' publiceret", time: "3 t siden" },
        { icon: CheckCircle2, text: "TSB-2026-095 lukket", time: "I går" },
      ]
    : [
        { icon: FileText, text: "Ny claim oprettet — CLM-2026-0051", time: "12 min siden" },
        { icon: CheckCircle2, text: "TSB-2026-108 accepteret", time: "I går" },
        { icon: Wrench, text: "Claim CLM-2026-0044 opdateret til 'I gang'", time: "2 dage siden" },
        { icon: Info, text: "Serviceinformation 'Bremseinspektion' publiceret", time: "3 dage siden" },
      ];

  return (
    <ProtectedRoute adminOnly={isAdmin}>
      <AppLayout
        variant={isAdmin ? "admin" : "dealer"}
        company={company}
        user={user}
        breadcrumbs={[{ label: "Dashboard" }]}
      >
        {/* Welcome */}
        <section
          className="rounded-[14px] border border-border-soft p-6 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--timan-green) 8%, white) 0%, white 60%)",
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timan Service Portal
              </div>
              <h1
                className="mt-1 text-[26px] font-semibold leading-tight"
                style={{ color: "var(--timan-red)" }}
              >
                Velkommen tilbage, {displayName}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {isAdmin
                  ? "Overblik over alle TSB-sager, claims og serviceaktivitet på tværs af forhandlere."
                  : "Her er status på dine åbne TSB'er, claims og maskiner i dag."}
              </p>
            </div>
            <Link
              to={isAdmin ? "/admin/tsb" : "/cases"}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--timan-green)" }}
            >
              <FolderKanban className="h-4 w-4" />
              Gå til mine sager
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Module cards */}
        <section className="mt-6">
          <h2 className="text-[16px] font-semibold">Moduler</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ModuleCard
              to="/service"
              icon={<Wrench className="h-5 w-5" />}
              title="Service / Claims"
              description="Opret og håndter garanticlaims og servicesager."
              accent="var(--timan-red)"
            />
            <ModuleCard
              to={isAdmin ? "/admin/tsb" : "/cases"}
              icon={<ClipboardList className="h-5 w-5" />}
              title="TSB Portal"
              description={
                isAdmin
                  ? "Opret og følg tekniske servicebulletiner på tværs af forhandlere."
                  : "Se og bekræft TSB'er for dine maskiner."
              }
              accent="var(--timan-green)"
            />
            <ModuleCard
              to="/manuals"
              icon={<BookOpen className="h-5 w-5" />}
              title="Brugermanualer"
              description="Find manualer, reservedelskataloger og tekniske dokumenter."
              accent="var(--timan-green)"
            />
            <ModuleCard
              to="/service-info"
              icon={<Info className="h-5 w-5" />}
              title="Serviceinformation"
              description="Læs publicerede service- og produktnyheder fra Timan."
              accent="var(--timan-red)"
            />
          </div>
        </section>

        {/* TSB KPIs */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold">TSB Portal</h2>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Globalt overblik" : "Status for din virksomhed"}
              </p>
            </div>
            <Link
              to={isAdmin ? "/admin/tsb" : "/cases"}
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--timan-green)" }}
            >
              Åbn TSB Portal <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div
            className={`mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 ${
              isAdmin ? "lg:grid-cols-6" : "lg:grid-cols-5"
            }`}
          >
            <StatCard label="Aktive TSB'er" value={String(tsbStats.active)} />
            <StatCard
              label="Afventer accept"
              value={String(tsbStats.awaiting)}
              tone={tsbStats.awaiting > 0 ? "warning" : "default"}
            />
            <StatCard
              label="Nær deadline"
              value={String(tsbStats.nearDeadline)}
              tone={tsbStats.nearDeadline > 0 ? "warning" : "default"}
            />
            <StatCard
              label="Forsinket"
              value={String(tsbStats.overdue)}
              tone={tsbStats.overdue > 0 ? "danger" : "default"}
            />
            {isAdmin && (
              <StatCard label="Forhandlere berørt" value={String(tsbStats.affectedDealers)} />
            )}
            <StatCard label="Maskiner berørt" value={String(tsbStats.affectedMachines)} />
          </div>
        </section>

        {/* Claims KPIs */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold">Service / Claims</h2>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Globalt overblik" : "Status for din virksomhed"}
              </p>
            </div>
            <Link
              to="/service"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--timan-green)" }}
            >
              Åbn Service / Claims <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div
            className={`mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 ${
              isAdmin ? "lg:grid-cols-7" : "lg:grid-cols-5"
            }`}
          >
            <StatCard label="Åbne claims" value={String(claimStats.open)} />
            <StatCard
              label="Afventer accept"
              value={String(claimStats.awaiting)}
              tone={claimStats.awaiting > 0 ? "warning" : "default"}
            />
            <StatCard label="I gang" value={String(claimStats.inProgress)} />
            <StatCard
              label="Klar til lukning"
              value={String(claimStats.readyToClose)}
              tone={claimStats.readyToClose > 0 ? "warning" : "default"}
            />
            <StatCard label="Afsluttede" value={String(claimStats.completed)} />
            {isAdmin && "rejected" in claimStats && (
              <>
                <StatCard
                  label="Afviste"
                  value={String(claimStats.rejected)}
                  tone={claimStats.rejected > 0 ? "danger" : "default"}
                />
                <StatCard
                  label="Gns. behandlingstid"
                  value={`${claimStats.avgHandlingDays} d`}
                />
              </>
            )}
          </div>
        </section>

        {/* Two-col: Requires attention + Recent activity */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Requires attention */}
          <div className="rounded-[10px] border border-border-soft bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border-soft p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" style={{ color: "var(--timan-red)" }} />
                <h2 className="text-[18px] font-semibold">Kræver opmærksomhed</h2>
              </div>
            </div>
            {attention.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Intet kræver opmærksomhed lige nu.
              </div>
            ) : (
              <ul className="divide-y divide-border-soft">
                {attention.map((row) => (
                  <li key={`${row.kind}-${row.id}`}>
                    <Link
                      // @ts-expect-error — dynamic route paths from string
                      to={row.href.to}
                      params={row.href.params}
                      className="flex items-start justify-between gap-3 p-4 transition-colors hover:bg-page-bg"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide"
                            style={{
                              backgroundColor:
                                row.kind === "tsb"
                                  ? "color-mix(in oklab, var(--timan-green) 12%, white)"
                                  : "color-mix(in oklab, var(--timan-red) 12%, white)",
                              color:
                                row.kind === "tsb"
                                  ? "var(--timan-green)"
                                  : "var(--timan-red)",
                            }}
                          >
                            {row.kind === "tsb" ? "TSB" : "Claim"}
                          </span>
                          <span className="font-mono font-semibold text-muted-foreground">
                            {row.id}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-sm font-medium">{row.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{row.meta}</div>
                      </div>
                      <StatusBadge
                        variant={
                          row.tone === "danger"
                            ? "danger"
                            : row.tone === "warning"
                              ? "warning"
                              : "info"
                        }
                      >
                        {row.badge}
                      </StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-[10px] border border-border-soft bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-border-soft p-5">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[18px] font-semibold">Seneste aktivitet</h2>
              </div>
            </div>
            <ul className="divide-y divide-border-soft">
              {recentActivity.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li key={i} className="flex items-start gap-3 p-4">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: "color-mix(in oklab, var(--timan-green) 10%, white)",
                        color: "var(--timan-green)",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm">{a.text}</div>
                      <div className="text-xs text-muted-foreground">{a.time}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Suppress unused import warnings for helpers we may use as the data evolves */}
        <span hidden>{deadlineLabel(visibleTsbs[0]?.deadline ?? "2030-01-01").label}</span>
      </AppLayout>
    </ProtectedRoute>
  );
}

function ModuleCard({
  to,
  icon,
  title,
  description,
  accent,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      // @ts-expect-error — module routes are typed via routeTree but we accept string here for flexibility
      to={to}
      className="group flex h-full flex-col rounded-[12px] border border-border-soft bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md"
          style={{
            backgroundColor: `color-mix(in oklab, ${accent} 12%, white)`,
            color: accent,
          }}
        >
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: accent }}
      >
        Åbn modul <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
