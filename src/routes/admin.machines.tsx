import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  AlertTriangle,
  Wrench,
  Plus,
  Upload,
  X,
  FileText,
  Building2,
  User,
  Calendar,
  Globe,
} from "lucide-react";
import { TsbAdminSidebarLayout } from "@/components/TsbAdminSidebarLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatusBadge } from "@/components/StatusBadge";
import { MockDataBanner } from "@/components/MockDataBanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MACHINE_DATA_SOURCE,
  useMachines,
  addManualMachine,
  getDuplicateSerials,
  getWarrantyRegistrationsForSerial,
  formatSyncTs,
  SOURCE_SYSTEM_LABEL,
  type MachineRecord,
} from "@/lib/machines-store";

export const Route = createFileRoute("/admin/machines")({
  head: () => ({ meta: [{ title: "Maskiner — Timan Admin" }] }),
  component: AdminMachinesPage,
});

type Filter = "alle" | "aktive" | "inaktive" | "dubletter" | "manuelle";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "aktive", label: "Aktive" },
  { id: "inaktive", label: "Ikke længere i kilde" },
  { id: "dubletter", label: "Dubletter" },
  { id: "manuelle", label: "Manuelt oprettet" },
];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminMachinesPage() {
  const machines = useMachines();
  const [filter, setFilter] = useState<Filter>("alle");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MachineRecord | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const duplicates = useMemo(() => getDuplicateSerials(machines), [machines]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = machines.filter((m) => {
      if (!q) return true;
      const hay = `${m.serialNumber} ${m.model} ${m.dealerName} ${m.customerName} ${
        m.dealerAccount ?? ""
      } ${m.warrantyRegistrationId ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
    switch (filter) {
      case "aktive":
        list = list.filter((m) => m.sourceActive && !m.inactiveFromSource);
        break;
      case "inaktive":
        list = list.filter((m) => m.inactiveFromSource);
        break;
      case "dubletter":
        list = list.filter((m) => duplicates.has(m.serialNumber.toLowerCase()));
        break;
      case "manuelle":
        list = list.filter((m) => m.sourceSystem === "manual");
        break;
    }
    // Sort so duplicates of the same serial sit next to each other.
    return [...list].sort((a, b) => {
      const sa = a.serialNumber.toLowerCase();
      const sb = b.serialNumber.toLowerCase();
      if (sa < sb) return -1;
      if (sa > sb) return 1;
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
    });
  }, [machines, filter, query, duplicates]);

  const counts = useMemo(
    () => ({
      total: machines.length,
      active: machines.filter((m) => m.sourceActive && !m.inactiveFromSource).length,
      inactive: machines.filter((m) => m.inactiveFromSource).length,
      duplicates: duplicates.size,
    }),
    [machines, duplicates],
  );

  const lastSync = useMemo(() => {
    const ts = machines
      .map((m) => m.lastSyncedAt)
      .filter((x): x is string => !!x)
      .sort()
      .reverse()[0];
    return formatSyncTs(ts);
  }, [machines]);

  return (
    <ProtectedRoute adminOnly>
      <TsbAdminSidebarLayout>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
              Maskiner
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {MACHINE_DATA_SOURCE === "sharepoint" ? (
                <>
                  Synkroniseret fra SharePoint-listen{" "}
                  <span className="font-mono">Garantiregistrering</span> · Sidst
                  synkroniseret: {lastSync}
                </>
              ) : (
                <>
                  <strong className="text-status-warning-fg">Preview-data</strong>
                  {" "}— reel sync mod{" "}
                  <span className="font-mono">Garantiregistrering</span> er endnu
                  ikke aktiv. Datamodellen er klar.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Aktive: <strong className="text-foreground">{counts.active}</strong>
              </span>
              <span>·</span>
              <span>
                I alt: <strong className="text-foreground">{counts.total}</strong>
              </span>
              {counts.duplicates > 0 && (
                <>
                  <span>·</span>
                  <span className="text-status-warning-fg">
                    Dubletter: <strong>{counts.duplicates}</strong>
                  </span>
                </>
              )}
              {counts.inactive > 0 && (
                <>
                  <span>·</span>
                  <span className="text-status-warning-fg">
                    Ikke i kilde: <strong>{counts.inactive}</strong>
                  </span>
                </>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Import fra SharePoint / Excel kommer senere", {
                  description:
                    "Datamodellen er klar — sync-job skal konfigureres mod SharePoint-listen Garantiregistrering.",
                })
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              Importér
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setAddOpen(true)}
              style={{ backgroundColor: "var(--timan-green)", color: "white" }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tilføj maskine
            </Button>
          </div>
        </div>

        {MACHINE_DATA_SOURCE === "mock" && (
          <MockDataBanner
            title="Maskinlisten er mock/preview-data"
            description={
              <>
                Maskinerne herunder er statiske eksempler. Når den rigtige sync
                mod SharePoint-listen{" "}
                <span className="font-mono">Garantiregistrering</span> aktiveres,
                bruges leveringsdato fra registreringen som kundens leveringsdato.
                Forsvundne rækker hård-slettes ikke — de markeres gult og bevares
                af hensyn til historiske TSB-sager.
              </>
            }
          />
        )}

        {/* Filters */}
        <div className="mt-5 rounded-[10px] border border-border-soft bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søg på serienummer, model, forhandler, kunde…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  size="sm"
                  variant={filter === f.id ? "default" : "outline"}
                  onClick={() => setFilter(f.id)}
                  style={
                    filter === f.id
                      ? { backgroundColor: "var(--timan-green)", color: "white" }
                      : undefined
                  }
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-[10px] border border-border-soft bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft bg-page-bg text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Serienummer</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Forhandler</th>
                  <th className="px-4 py-3 font-medium">Kunde</th>
                  <th className="px-4 py-3 font-medium">Leveret</th>
                  <th className="px-4 py-3 font-medium">Land</th>
                  <th className="px-4 py-3 font-medium">Kilde</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      Ingen maskiner matcher dine filtre.
                    </td>
                  </tr>
                )}
                {filtered.map((m) => {
                  const isDup = duplicates.has(m.serialNumber.toLowerCase());
                  const inactive = m.inactiveFromSource;
                  const warn = isDup || inactive;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={cn(
                        "cursor-pointer border-b border-border-soft last:border-b-0 hover:bg-page-bg",
                        warn && "bg-status-warning-bg/30",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Wrench className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-mono text-xs font-medium">
                              {m.serialNumber}
                            </div>
                            {isDup && (
                              <div className="mt-1">
                                <StatusBadge variant="warning">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Dublet
                                </StatusBadge>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{m.model}</td>
                      <td className="px-4 py-3">
                        <div>{m.dealerName}</div>
                        {m.dealerAccount && (
                          <div className="font-mono text-xs text-muted-foreground">
                            {m.dealerAccount}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{m.customerName}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(m.deliveryDate)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{m.country}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {SOURCE_SYSTEM_LABEL[m.sourceSystem]}
                      </td>
                      <td className="px-4 py-3">
                        {inactive ? (
                          <StatusBadge variant="warning">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Ikke i kilde
                          </StatusBadge>
                        ) : (
                          <StatusBadge variant="success">Aktiv</StatusBadge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Maskiner slettes aldrig hårdt — historik bevares for sporbarhed på
          tværs af TSB-sager.
        </p>

        {/* Detail side panel */}
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selected && <MachineDetail machine={selected} />}
          </SheetContent>
        </Sheet>

        {/* Add machine dialog */}
        <AddMachineDialog open={addOpen} onOpenChange={setAddOpen} />
      </AppLayout>
    </ProtectedRoute>
  );
}

// ---------------- Detail panel ----------------

function MachineDetail({ machine }: { machine: MachineRecord }) {
  const allMachines = useMachines();
  const sameSerial = allMachines.filter(
    (m) => m.serialNumber.toLowerCase() === machine.serialNumber.toLowerCase(),
  );
  const isDup = sameSerial.length > 1;
  const warranties = getWarrantyRegistrationsForSerial(machine.serialNumber);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-mono">{machine.serialNumber}</SheetTitle>
        <SheetDescription>
          {machine.model} · {SOURCE_SYSTEM_LABEL[machine.sourceSystem]}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4 space-y-2">
        {isDup && (
          <div className="flex items-start gap-2 rounded-md border bg-status-warning-bg p-3 text-sm"
            style={{ borderColor: "var(--status-warning-fg)" }}>
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0"
              style={{ color: "var(--status-warning-fg)" }} />
            <div>
              <div className="font-semibold" style={{ color: "var(--status-warning-fg)" }}>
                Dublet — serienummer findes {sameSerial.length} gange
              </div>
              <div className="mt-0.5 text-xs text-foreground/80">
                Gennemgå rækkerne nedenfor og afgør hvilken der skal være den
                aktive registrering.
              </div>
            </div>
          </div>
        )}
        {machine.inactiveFromSource && (
          <div className="flex items-start gap-2 rounded-md border bg-status-warning-bg p-3 text-sm"
            style={{ borderColor: "var(--status-warning-fg)" }}>
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0"
              style={{ color: "var(--status-warning-fg)" }} />
            <div>
              <div className="font-semibold" style={{ color: "var(--status-warning-fg)" }}>
                Ikke længere i kildedata
              </div>
              <div className="mt-0.5 text-xs text-foreground/80">
                Bevares for historik — ingen hård sletning.
              </div>
            </div>
          </div>
        )}
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <DetailRow icon={Building2} label="Forhandler">
          <div>{machine.dealerName}</div>
          {machine.dealerAccount && (
            <div className="font-mono text-xs text-muted-foreground">
              Account {machine.dealerAccount}
            </div>
          )}
        </DetailRow>
        <DetailRow icon={User} label="Kunde">{machine.customerName}</DetailRow>
        <DetailRow icon={Calendar} label="Leveringsdato">
          {formatDate(machine.deliveryDate)}
        </DetailRow>
        <DetailRow icon={Globe} label="Land">
          <span className="font-mono">{machine.country}</span>
        </DetailRow>
        {machine.warrantyRegistrationId && (
          <DetailRow icon={FileText} label="Garantiregistrering">
            <span className="font-mono text-xs">{machine.warrantyRegistrationId}</span>
          </DetailRow>
        )}
        <DetailRow icon={Calendar} label="Sidst synkroniseret">
          <span className="text-xs text-muted-foreground">
            {formatSyncTs(machine.lastSyncedAt)}
          </span>
        </DetailRow>
        {machine.notes && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Noter
            </div>
            <p className="mt-1 text-sm">{machine.notes}</p>
          </div>
        )}
      </dl>

      {/* Warranty registrations */}
      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Garantiregistreringer for serienummer
        </div>
        {warranties.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Ingen garantiregistrering fundet for dette serienummer.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {warranties.map((w) => (
              <li
                key={w.id}
                className="rounded-md border border-border-soft bg-page-bg p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{w.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(w.deliveryDate)}
                  </span>
                </div>
                <div className="mt-1">{w.customerName}</div>
                {w.dealerName && (
                  <div className="text-xs text-muted-foreground">{w.dealerName}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Other rows with same serial */}
      {isDup && (
        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Andre rækker med samme serienummer
          </div>
          <ul className="mt-2 space-y-2">
            {sameSerial
              .filter((m) => m.id !== machine.id)
              .map((m) => (
                <li
                  key={m.id}
                  className="rounded-md border bg-status-warning-bg/40 p-3 text-sm"
                  style={{ borderColor: "var(--status-warning-fg)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {SOURCE_SYSTEM_LABEL[m.sourceSystem]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(m.deliveryDate)}
                    </span>
                  </div>
                  <div className="mt-1">{m.customerName}</div>
                  <div className="text-xs text-muted-foreground">{m.dealerName}</div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

// ---------------- Add machine dialog ----------------

function AddMachineDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const machines = useMachines();
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [dealerName, setDealerName] = useState("");
  const [dealerAccount, setDealerAccount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [country, setCountry] = useState("DK");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  const trimmedSerial = serialNumber.trim();
  const duplicateExists =
    !!trimmedSerial &&
    machines.some(
      (m) => m.serialNumber.toLowerCase() === trimmedSerial.toLowerCase(),
    );

  const reset = () => {
    setSerialNumber("");
    setModel("");
    setDealerName("");
    setDealerAccount("");
    setCustomerName("");
    setCountry("DK");
    setDeliveryDate("");
    setNotes("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedSerial || !model.trim() || !dealerName.trim() || !customerName.trim()) {
      toast.error("Udfyld serienummer, model, forhandler og kunde");
      return;
    }
    addManualMachine({
      serialNumber: trimmedSerial,
      model,
      dealerName,
      dealerAccount: dealerAccount || undefined,
      customerName,
      country,
      deliveryDate: deliveryDate || undefined,
      notes: notes || undefined,
    });
    toast.success(`Maskine ${trimmedSerial} tilføjet`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tilføj maskine manuelt</DialogTitle>
          <DialogDescription>
            Manuelt tilføjede maskiner markeres som kilde "Manuel" og forbliver
            også, hvis SharePoint-sync aktiveres senere.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="serial">Serienummer *</Label>
            <Input
              id="serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="TM-X40-XXXXX"
              className="font-mono"
              required
            />
            {duplicateExists && (
              <div className="mt-1 flex items-center gap-1 text-xs"
                style={{ color: "var(--status-warning-fg)" }}>
                <AlertTriangle className="h-3 w-3" />
                Serienummeret findes allerede — vil blive markeret som dublet.
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="X40 Pro"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                placeholder="DK"
                maxLength={3}
                className="font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dealer">Forhandler *</Label>
              <Input
                id="dealer"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                placeholder="Nordic Machinery Aps"
                required
              />
            </div>
            <div>
              <Label htmlFor="dealer-account">Account</Label>
              <Input
                id="dealer-account"
                value={dealerAccount}
                onChange={(e) => setDealerAccount(e.target.value)}
                placeholder="100214"
                className="font-mono"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customer">Kunde *</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Bygge A/S"
              required
            />
          </div>
          <div>
            <Label htmlFor="delivery">Leveringsdato</Label>
            <Input
              id="delivery"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Noter</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eventuelle bemærkninger…"
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Annullér
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: "var(--timan-green)", color: "white" }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tilføj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
