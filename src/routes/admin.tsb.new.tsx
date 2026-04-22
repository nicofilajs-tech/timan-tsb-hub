import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, type DragEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Calendar,
  Building2,
  Wrench,
  ClipboardCheck,
  Upload,
  Search,
  X,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  createTsb,
  DEALER_DATA_SOURCE,
  getDealers,
  getMachinesForDealer,
  nextTsbId,
  PARTNER_TYPE_LABEL,
  type Severity,
} from "@/lib/tsb-store";
import { StatusBadge } from "@/components/StatusBadge";
import { MockDataBanner } from "@/components/MockDataBanner";

export const Route = createFileRoute("/admin/tsb/new")({
  head: () => ({ meta: [{ title: "Ny TSB — Timan Admin" }] }),
  component: NewTsbPage,
});

const STEPS = [
  { id: "basis", label: "Grundoplysninger", icon: FileText },
  { id: "deadline", label: "Tidsplan", icon: Calendar },
  { id: "dokument", label: "Dokumenter", icon: Upload },
  { id: "dealers", label: "Forhandlere", icon: Building2 },
  { id: "machines", label: "Maskiner", icon: Wrench },
  { id: "review", label: "Gennemse & aktivér", icon: ClipboardCheck },
] as const;

type StepId = typeof STEPS[number]["id"];

function NewTsbPage() {
  const navigate = useNavigate();
  const dealers = getDealers();
  const draftId = useMemo(() => nextTsbId(), []);

  const [step, setStep] = useState<StepId>("basis");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>(3);
  const [activeFrom, setActiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  );
  const [documentName, setDocumentName] = useState("");
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<Record<string, string[]>>({});
  const [dealerQuery, setDealerQuery] = useState("");
  const [dealerPickerOpen, setDealerPickerOpen] = useState(false);

  const dealerSearchResults = useMemo(() => {
    const q = dealerQuery.trim().toLowerCase();
    if (!q) return dealers;
    return dealers.filter((d) => {
      const hay = `${d.name} ${d.city} ${d.country} ${d.sharepointAccount ?? ""} ${PARTNER_TYPE_LABEL[d.partnerType]}`.toLowerCase();
      return hay.includes(q);
    });
  }, [dealers, dealerQuery]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const isLast = stepIndex === STEPS.length - 1;
  const canNext = (() => {
    if (step === "basis") return title.trim().length > 1;
    if (step === "deadline") return !!deadline && !!activeFrom;
    if (step === "dealers") return selectedDealers.length > 0;
    if (step === "machines")
      return selectedDealers.every(
        (d) => (selectedMachines[d]?.length ?? 0) > 0,
      );
    return true;
  })();

  const goNext = () => {
    if (!isLast) setStep(STEPS[stepIndex + 1].id);
  };
  const goPrev = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  };

  const toggleDealer = (id: string) => {
    setSelectedDealers((prev) => {
      const next = prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id];
      // when removing, drop machines for that dealer
      if (!next.includes(id)) {
        setSelectedMachines((sm) => {
          const { [id]: _drop, ...rest } = sm;
          return rest;
        });
      } else {
        // pre-select all machines for the dealer
        setSelectedMachines((sm) => ({
          ...sm,
          [id]: getMachinesForDealer(id).map((m) => m.serial),
        }));
      }
      return next;
    });
  };

  const toggleMachine = (dealerId: string, serial: string) => {
    setSelectedMachines((prev) => {
      const list = prev[dealerId] ?? [];
      const next = list.includes(serial) ? list.filter((s) => s !== serial) : [...list, serial];
      return { ...prev, [dealerId]: next };
    });
  };

  const handleSave = (activate: boolean) => {
    const tsb = createTsb({
      title: title.trim(),
      description: description.trim(),
      severity,
      activeFrom,
      deadline,
      documentName: documentName || undefined,
      status: activate ? "aktiv" : "kladde",
      dealers: selectedDealers.map((dealerId) => ({
        dealerId,
        status: "afventer",
        machineSerials: selectedMachines[dealerId] ?? [],
      })),
    });
    toast.success(
      activate ? `${tsb.id} er aktiveret og sendt til forhandlere` : `${tsb.id} gemt som kladde`,
    );
    navigate({ to: "/admin/tsb/$id", params: { id: tsb.id } });
  };

  return (
    <ProtectedRoute adminOnly>
      <AppLayout
        variant="admin"
        company="Timan Intern"
        user={{ initials: "TA", name: "Timan Admin", role: "Intern" }}
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "TSB'er", to: "/admin/tsb" },
          { label: "Ny" },
        ]}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
              Opret ny TSB
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Foreslået nummer: <span className="font-mono">{draftId}</span>
            </p>
          </div>
        </div>

        {/* Stepper */}
        <ol className="mt-5 flex flex-wrap gap-2 rounded-[10px] border border-border-soft bg-white p-3 shadow-sm">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = i < stepIndex;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active && "bg-status-success-bg text-status-success-fg",
                    !active && done && "text-foreground hover:bg-page-bg",
                    !active && !done && "text-muted-foreground hover:bg-page-bg",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                      active
                        ? "bg-white text-status-success-fg"
                        : done
                        ? "text-white"
                        : "border border-border-soft text-muted-foreground",
                    )}
                    style={done ? { backgroundColor: "var(--timan-green)" } : undefined}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 rounded-[10px] border border-border-soft bg-white p-6 shadow-sm">
          {step === "basis" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Grundoplysninger</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    placeholder="F.eks. Softwareopdatering — styreenhed v3.2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={String(severity)} onValueChange={(v) => setSeverity(Number(v) as Severity)}>
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Severity 1 — Kritisk</SelectItem>
                      <SelectItem value="2">Severity 2 — Høj</SelectItem>
                      <SelectItem value="3">Severity 3 — Medium</SelectItem>
                      <SelectItem value="4">Severity 4 — Lav</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="desc">Beskrivelse</Label>
                  <Textarea
                    id="desc"
                    rows={5}
                    placeholder="Kort beskrivelse af hvad denne TSB dækker..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "deadline" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Tidsplan</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="from">Aktiv fra</Label>
                  <Input
                    id="from"
                    type="date"
                    value={activeFrom}
                    onChange={(e) => setActiveFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dl">Deadline</Label>
                  <Input
                    id="dl"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "dokument" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Dokumenter</h2>
              <p className="text-sm text-muted-foreground">
                Vedhæft den officielle TSB PDF (valgfrit i denne preview).
              </p>
              <div className="rounded-md border border-dashed border-border-soft p-6 text-center">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <div className="mt-2 text-sm text-muted-foreground">
                  Træk og slip — eller indtast filnavn:
                </div>
                <Input
                  className="mx-auto mt-3 max-w-sm"
                  placeholder="TSB-2026-XXX_DA.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === "dealers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Vælg forhandlere</h2>
                <div className="text-sm text-muted-foreground">
                  {selectedDealers.length} valgt · {dealers.length}{" "}
                  {DEALER_DATA_SOURCE === "sharepoint" ? "fra SharePoint" : "i preview"}
                </div>
              </div>

              {DEALER_DATA_SOURCE === "mock" && (
                <MockDataBanner
                  title="Forhandlerne nedenfor er preview-data"
                  description={
                    <>
                      Listen kommer i den endelige version fra SharePoint
                      (<span className="font-mono">DebitorFiltered</span>). Du
                      kan stadig vælge forhandlere her for at teste flowet —
                      når den rigtige sync er aktiv, bruges de samme felter
                      (Title, Account, A_B_KUNDE, COUNTRY).
                    </>
                  }
                />
              )}

              {/* Searchable dealer picker */}
              <div className="space-y-2">
                <Label>Søg og tilføj forhandler</Label>
                <Popover open={dealerPickerOpen} onOpenChange={setDealerPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal text-muted-foreground"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Søg på navn, by, account eller type…
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <div className="border-b border-border-soft p-2">
                      <Input
                        autoFocus
                        placeholder="Skriv for at filtrere…"
                        value={dealerQuery}
                        onChange={(e) => setDealerQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto py-1">
                      {dealerSearchResults.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                          Ingen forhandlere matcher "{dealerQuery}"
                        </div>
                      )}
                      {dealerSearchResults.map((d) => {
                        const checked = selectedDealers.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDealer(d.id)}
                            className={cn(
                              "flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-page-bg",
                              d.inactiveFromSource && "bg-status-warning-bg/30",
                            )}
                          >
                            <Checkbox checked={checked} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{d.name}</span>
                                {d.inactiveFromSource && (
                                  <AlertTriangle
                                    className="h-3 w-3"
                                    style={{ color: "var(--status-warning-fg)" }}
                                  />
                                )}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                <span>{PARTNER_TYPE_LABEL[d.partnerType]}</span>
                                <span>·</span>
                                <span className="font-mono">{d.country}</span>
                                <span>·</span>
                                <span>{d.city}</span>
                                {d.sharepointAccount && (
                                  <>
                                    <span>·</span>
                                    <span className="font-mono">#{d.sharepointAccount}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Selected dealer chips */}
                {selectedDealers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDealers.map((id) => {
                      const d = dealers.find((x) => x.id === id);
                      if (!d) return null;
                      return (
                        <span
                          key={id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                            d.inactiveFromSource
                              ? "bg-status-warning-bg text-status-warning-fg"
                              : "bg-status-success-bg text-status-success-fg",
                          )}
                        >
                          {d.inactiveFromSource && <AlertTriangle className="h-3 w-3" />}
                          {d.name}
                          <button
                            type="button"
                            onClick={() => toggleDealer(id)}
                            className="ml-0.5 rounded-full hover:bg-black/10"
                            aria-label={`Fjern ${d.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Full grid (still useful as overview) */}
              <div className="pt-2">
                <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                  Eller vælg fra hele listen
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {dealers.map((d) => {
                    const checked = selectedDealers.includes(d.id);
                    const inactive = d.inactiveFromSource;
                    return (
                      <label
                        key={d.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
                          checked && !inactive && "border-transparent bg-status-success-bg",
                          checked && inactive && "border-status-warning-fg/40 bg-status-warning-bg",
                          !checked && inactive && "border-status-warning-fg/30 bg-status-warning-bg/30 hover:bg-status-warning-bg/50",
                          !checked && !inactive && "border-border-soft hover:bg-page-bg",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleDealer(d.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{d.name}</div>
                            <div className="text-xs text-muted-foreground">{d.machineCount} maskiner</div>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {d.city} · {d.country} · {d.contact}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <StatusBadge variant="info">
                              {PARTNER_TYPE_LABEL[d.partnerType]}
                            </StatusBadge>
                            {d.sharepointAccount && (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                #{d.sharepointAccount}
                              </span>
                            )}
                            {inactive && (
                              <StatusBadge variant="warning">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Ikke i SharePoint
                              </StatusBadge>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {step === "machines" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Vælg berørte maskiner</h2>
              <p className="text-sm text-muted-foreground">
                Som standard er alle forhandlerens maskiner valgt. Fravælg dem der ikke er berørt.
              </p>
              {selectedDealers.length === 0 && (
                <div className="rounded-md border border-dashed border-border-soft p-6 text-center text-sm text-muted-foreground">
                  Vælg mindst én forhandler først.
                </div>
              )}
              {selectedDealers.map((dealerId) => {
                const dealer = dealers.find((d) => d.id === dealerId)!;
                const machines = getMachinesForDealer(dealerId);
                const selected = selectedMachines[dealerId] ?? [];
                return (
                  <div key={dealerId} className="rounded-md border border-border-soft">
                    <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                      <div className="font-medium">{dealer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selected.length} af {machines.length} valgt
                      </div>
                    </div>
                    <ul className="divide-y divide-border-soft">
                      {machines.map((m) => {
                        const checked = selected.includes(m.serial);
                        return (
                          <li key={m.serial}>
                            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-page-bg">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleMachine(dealerId, m.serial)}
                              />
                              <div className="flex flex-1 items-center justify-between">
                                <div>
                                  <div className="font-mono text-sm">{m.serial}</div>
                                  <div className="text-xs text-muted-foreground">{m.model}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">{m.customer}</div>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Gennemse og aktivér</h2>
              <ReviewRow label="TSB nummer" value={<span className="font-mono">{draftId}</span>} />
              <ReviewRow label="Titel" value={title || "—"} />
              <ReviewRow label="Severity" value={`Severity ${severity}`} />
              <ReviewRow label="Aktiv fra" value={activeFrom} />
              <ReviewRow label="Deadline" value={deadline} />
              <ReviewRow label="Dokument" value={documentName || "Intet vedhæftet"} />
              <ReviewRow
                label="Forhandlere"
                value={
                  <div className="space-y-1">
                    {selectedDealers.length === 0 && <span className="text-muted-foreground">Ingen valgt</span>}
                    {selectedDealers.map((id) => {
                      const d = dealers.find((x) => x.id === id)!;
                      const m = (selectedMachines[id] ?? []).length;
                      return (
                        <div key={id} className="flex items-center justify-between gap-3">
                          <span>{d.name}</span>
                          <span className="text-xs text-muted-foreground">{m} maskiner</span>
                        </div>
                      );
                    })}
                  </div>
                }
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={goPrev} disabled={stepIndex === 0}>
            <ArrowLeft className="h-4 w-4" /> Tilbage
          </Button>
          <div className="flex items-center gap-2">
            {isLast ? (
              <>
                <Button variant="outline" onClick={() => handleSave(false)}>
                  Gem som kladde
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={selectedDealers.length === 0 || !title.trim()}
                  style={{ backgroundColor: "var(--timan-green)", color: "white" }}
                >
                  <Check className="h-4 w-4" /> Aktivér TSB
                </Button>
              </>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canNext}
                style={{ backgroundColor: "var(--timan-green)", color: "white" }}
              >
                Næste <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border-soft pb-3 last:border-0 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
