import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WarrantyAdminSidebarLayout } from "@/components/WarrantyAdminSidebarLayout";
import {
  MACHINE_TYPES,
  useWarrantyRecords,
  type WarrantyRegistration,
} from "@/lib/warranty-store";

export const Route = createFileRoute("/admin/warranty/mine")({
  head: () => ({
    meta: [
      { title: "Mine registreringer — Garantiregistrering — Timan Service Portal" },
    ],
  }),
  component: MineRegistreringerRoute,
});

function MineRegistreringerRoute() {
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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Mine registreringer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Søg og filtrér i alle garantiregistreringer.
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

function Body() {
  const records = useWarrantyRecords();
  const [q, setQ] = useState("");
  const [machine, setMachine] = useState("");
  const [dealer, setDealer] = useState("");
  const [language, setLanguage] = useState("");

  const dealers = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.dealerName));
    return Array.from(set).sort();
  }, [records]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.language && set.add(r.language));
    return Array.from(set).sort();
  }, [records]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return records.filter((r) => {
      if (machine && r.machineType !== machine) return false;
      if (dealer && r.dealerName !== dealer) return false;
      if (language && r.language !== language) return false;
      if (!ql) return true;
      return (
        r.customer.toLowerCase().includes(ql) ||
        r.dealerName.toLowerCase().includes(ql) ||
        r.machineType.toLowerCase().includes(ql) ||
        r.machineSerial.toLowerCase().includes(ql) ||
        r.confirmationEmail.toLowerCase().includes(ql) ||
        r.certificateNumber.toLowerCase().includes(ql)
      );
    });
  }, [records, q, machine, dealer, language]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Søg kunde, serienr, certifikat …"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <Select
            value={dealer}
            onChange={setDealer}
            placeholder="Alle forhandlere"
            options={dealers}
          />
          <Select
            value={machine}
            onChange={setMachine}
            placeholder="Alle maskintyper"
            options={MACHINE_TYPES.map((m) => m as string)}
          />
          <Select
            value={language}
            onChange={setLanguage}
            placeholder="Alle sprog"
            options={languages}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500">
          {filtered.length} af {records.length} registreringer
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Ingen registreringer matcher din søgning.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-3">Certifikat</th>
                  <th className="px-6 py-3">Kunde</th>
                  <th className="px-6 py-3">Forhandler</th>
                  <th className="px-6 py-3">Maskintype</th>
                  <th className="px-6 py-3">Serienr</th>
                  <th className="px-6 py-3">Levering</th>
                  <th className="px-6 py-3">Sprog</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 250).map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </tbody>
            </table>
            {filtered.length > 250 && (
              <div className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-500">
                Viser de første 250 — brug filtre for at indsnævre.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ r }: { r: WarrantyRegistration }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="whitespace-nowrap px-6 py-3 font-mono text-xs font-black text-slate-700">
        {r.certificateNumber}
      </td>
      <td className="px-6 py-3">
        <div className="font-bold text-slate-900">{r.customer || "—"}</div>
        <div className="text-xs text-slate-500">{r.postalCity}</div>
      </td>
      <td className="px-6 py-3 font-bold text-slate-700">{r.dealerName}</td>
      <td className="px-6 py-3">{r.machineType || "—"}</td>
      <td className="whitespace-nowrap px-6 py-3 font-mono text-xs">
        {r.machineSerial || "—"}
      </td>
      <td className="whitespace-nowrap px-6 py-3 text-slate-600">
        {r.deliveryDate || "—"}
      </td>
      <td className="whitespace-nowrap px-6 py-3 text-slate-500">
        {r.language ?? "—"}
      </td>
    </tr>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
