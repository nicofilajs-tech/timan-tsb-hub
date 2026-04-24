import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import { useWarrantyRecords, type WarrantyRegistration } from "@/lib/warranty-store";

export const Route = createFileRoute("/admin/warranty/certificates")({
  head: () => ({
    meta: [
      {
        title:
          "Registrerede garantibeviser — Garantiregistrering — Timan Service Portal",
      },
    ],
  }),
  component: CertificatesRoute,
});

function CertificatesRoute() {
  return (
    <ProtectedRoute adminOnly>
      <WarrantyAdminSidebarLayout intro={<Intro />}>
        <Body />
      </WarrantyAdminSidebarLayout>
    </ProtectedRoute>
  );
}

function Intro() {
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">
        Registrerede garantibeviser
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Alle udstedte garantibeviser. Klik på en række for at se eller downloade.
      </p>
    </div>
  );
}

function Body() {
  const records = useWarrantyRecords();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<WarrantyRegistration | null>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return records;
    return records.filter(
      (r) =>
        r.certificateNumber.toLowerCase().includes(ql) ||
        r.customer.toLowerCase().includes(ql) ||
        r.dealerName.toLowerCase().includes(ql) ||
        r.machineSerial.toLowerCase().includes(ql),
    );
  }, [records, q]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Søg certifikat, kunde, serienr …"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500">
          {filtered.length} garantibeviser
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Ingen garantibeviser fundet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-3">Certifikat</th>
                  <th className="px-6 py-3">Forhandler</th>
                  <th className="px-6 py-3">Kunde</th>
                  <th className="px-6 py-3">Maskintype</th>
                  <th className="px-6 py-3">Serienr</th>
                  <th className="px-6 py-3">Levering</th>
                  <th className="px-6 py-3">Oprettet</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 250).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs font-black text-slate-700">
                      {r.certificateNumber}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-700">
                      {r.dealerName}
                    </td>
                    <td className="px-6 py-3">{r.customer || "—"}</td>
                    <td className="px-6 py-3">{r.machineType || "—"}</td>
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs">
                      {r.machineSerial || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-600">
                      {r.deliveryDate || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-600">
                      {r.createdAt.slice(0, 10)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> Vis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 250 && (
              <div className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-500">
                Viser de første 250.
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <CertificateDialog record={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: WarrantyRegistration["status"] }) {
  const map: Record<
    WarrantyRegistration["status"],
    { label: string; cls: string }
  > = {
    active: { label: "Aktiv", cls: "bg-emerald-50 text-emerald-700" },
    draft: { label: "Kladde", cls: "bg-amber-50 text-amber-700" },
    archived: { label: "Arkiveret", cls: "bg-slate-100 text-slate-600" },
  };
  const v = map[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function CertificateDialog({
  record,
  onClose,
}: {
  record: WarrantyRegistration;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Garantibevis
            </p>
            <h3 className="mt-0.5 font-mono text-lg font-black">
              {record.certificateNumber}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              onClick={() => alert("Download PDF kommer snart.")}
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Luk
            </button>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-6 py-5 text-sm md:grid-cols-2">
          <Row label="Forhandler" value={record.dealerName} />
          <Row label="Kunde" value={record.customer} />
          <Row label="Maskintype" value={record.machineType} />
          <Row label="Serienr" value={record.machineSerial} mono />
          <Row label="Demo" value={record.isDemo} />
          <Row label="Erstatter" value={record.replacementBrand ?? "—"} />
          <Row label="Leveringsdato" value={record.deliveryDate || "—"} />
          <Row label="Adresse" value={record.customerAddress} />
          <Row label="Postnr/by" value={record.postalCity} />
          <Row label="Telefon" value={record.phone} />
          <Row label="E-mail" value={record.confirmationEmail} />
          <Row label="Sprog" value={record.language ?? "—"} />
          {record.toolSerials.length > 0 && (
            <Row
              label="Redskaber"
              value={record.toolSerials.join(", ")}
              mono
              span2
            />
          )}
          {record.comment && (
            <Row label="Kommentar" value={record.comment} span2 />
          )}
        </dl>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  span2,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <dt className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </dt>
      <dd className={`mt-0.5 ${mono ? "font-mono text-xs" : ""} text-slate-800`}>
        {value || "—"}
      </dd>
    </div>
  );
}
