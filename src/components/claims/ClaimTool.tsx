/**
 * Timan Service Portal — Claim / Reclamation tool.
 *
 * Standalone component used by the Service / Claims page.
 * Local state only — not connected to Supabase yet.
 */

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Phone,
  Plus,
  Printer,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { usePortalLanguage, type PortalLang } from "@/components/PortalHeader";
import type { ClaimRecord } from "@/lib/claims-store";

const LANGUAGES = [
  { code: "dk", name: "Dansk", flag: "DK" },
  { code: "gb", name: "English", flag: "GB" },
  { code: "de", name: "Deutsch", flag: "DE" },
  { code: "se", name: "Svenska", flag: "SE" },
  { code: "fr", name: "Francais", flag: "FR" },
  { code: "es", name: "Espanol", flag: "ES" },
  { code: "it", name: "Italiano", flag: "IT" },
  { code: "pl", name: "Polski", flag: "PL" },
  { code: "cz", name: "Cestina", flag: "CZ" },
  { code: "hu", name: "Magyar", flag: "HU" },
] as const;

const TRANSLATIONS = {
  dk: {
    title: "Reklamationsværktøj",
    subtitle: "Officiel portal for forhandlere",
    validationError:
      "Fejl: Udfyld alle felter med * og sørg for at emails indeholder @.",
    intro: {
      title: "Vigtig information",
      ok: "Forstået - Start reklamation",
      body:
        "Reklamationen vil ikke blive behandlet, og reparationen bør ikke igangsættes, uden at Timan forudgående er kontaktet og der er udleveret et reklamationsnummer.\n\nTimetaksten er fastsat i aftalen mellem Timan og forhandleren.\n\nReklamationsrapporten skal returneres til Timan senest 10 dage efter udførelse af arbejdet.\n\nNår reklamationsarbejdet er udført og senest 3 måneder efter udstedelse af reklamationsnummeret, behandler og krediterer Timan den indsendte rapport senest 14 dage efter modtagelse.",
    },
    steps: {
      s1: "Kontakt Timan før start",
      s2: "Reklamations nr.",
      s3: "Forhandler & Ejer",
      s4: "Maskin Info",
      s5: "Dato",
      s6: "Beskrivelse",
      s7: "Reservedele & Arbejde",
      s8: "Generer PDF",
    },
    sections: {
      dealer: "Forhandler Information",
      owner: "Ejer Information",
      machine: "Maskin Information",
      dates: "Datoer",
      parts: "RESERVEDELE & ARBEJDE",
      summary: "OVERSIGT",
    },
    labels: {
      dealer: "Forhandler",
      country: "Land",
      contact: "Kontaktperson",
      phone: "Telefon nr.",
      email: "Mail",
      owner: "Ejer",
      address: "Vej / gade",
      postal: "Postnummer",
      machineType: "Maskintype",
      serialNo: "Serienummer",
      hours: "Timetæller stand",
      guaranteeNo: "Garantinummer (Tildeles af Timan)",
      saleDate: "Salgsdato",
      damageDate: "Skadesdato",
      approvedDate: "Godkendt dato",
      repairDate: "Reparationsdato",
      faultDesc: "Fejlbeskrivelse",
      repairDesc: "Reparationsbeskrivelse",
      qty: "Antal",
      partNo: "Reservedelsnr.",
      desc: "Beskrivelse",
      unitPrice: "Stykpris Netto",
      totalPrice: "Pris i alt",
      workingHours: "Arbejdstimer",
      drivingKm: "Antal kørte km",
      summaryKm: "Kørte km",
      totalSum: "TOTAL SUM",
      submit: "Generer PDF",
      disclaimer:
        "Reklamationen behandles kun med forudgående kontakt og nummer.",
    },
  },
  gb: {
    title: "Reclamation Tool",
    subtitle: "Official Dealer Portal",
    validationError: "Error: Fill in all fields with * and check emails.",
    intro: {
      title: "Important information",
      ok: "OK - Start Claim",
      body:
        "The claim will not be processed, and the repair must not be started, unless Timan has been contacted in advance and a claim number has been issued.",
    },
    steps: {
      s1: "Contact Timan first",
      s2: "Claim No.",
      s3: "Dealer & Owner",
      s4: "Machine Info",
      s5: "Dates",
      s6: "Description",
      s7: "Parts & Labor",
      s8: "Generate PDF",
    },
    sections: {
      dealer: "Dealer Information",
      owner: "Owner Information",
      machine: "Machine Info",
      dates: "Dates",
      parts: "PARTS & LABOR",
      summary: "SUMMARY",
    },
    labels: {
      dealer: "Dealer",
      country: "Country",
      contact: "Contact Person",
      phone: "Phone No.",
      email: "Email",
      owner: "Owner",
      address: "Address",
      postal: "Postal Code",
      machineType: "Type",
      serialNo: "Serial No.",
      hours: "Hours",
      guaranteeNo: "Warranty No.",
      saleDate: "Sale Date",
      damageDate: "Damage Date",
      approvedDate: "Approved Date",
      repairDate: "Repair Date",
      faultDesc: "Fault Desc.",
      repairDesc: "Repair Desc.",
      qty: "Qty",
      partNo: "Part No.",
      desc: "Description",
      unitPrice: "Net Price",
      totalPrice: "Total",
      workingHours: "Labor Hours",
      drivingKm: "Driven km",
      summaryKm: "Driven km",
      totalSum: "TOTAL SUM",
      submit: "Generate PDF",
      disclaimer: "Claims only processed with prior contact.",
    },
  },
} as const;

type LanguageCode = keyof typeof TRANSLATIONS;

type PartLine = {
  id: number;
  qty: string;
  partNo: string;
  desc: string;
  unitPrice: string;
};

/** Map shared portal language → claim translation key (only DK/GB exist). */
function mapPortalLang(p: PortalLang): LanguageCode {
  return p === "DK" ? "dk" : "gb";
}

export interface ClaimToolProps {
  /** When provided, the form is prefilled with this claim's detail. */
  initialClaim?: ClaimRecord;
  /** When true, the entire form is rendered read-only and submission is hidden. */
  readOnly?: boolean;
}

export function ClaimTool({ initialClaim, readOnly = false }: ClaimToolProps = {}) {
  const [portalLang] = usePortalLanguage();
  const lang = mapPortalLang(portalLang);
  const [showErrors, setShowErrors] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  // Skip the intro modal when opening an existing claim (view/edit), or in
  // read-only mode where no submission is possible anyway.
  const [showIntro, setShowIntro] = useState(!initialClaim && !readOnly);

  const t = (key: string): string => {
    const parts = key.split(".");
    let translation: unknown = TRANSLATIONS[lang] ?? TRANSLATIONS.gb;
    for (const part of parts) {
      if (translation && typeof translation === "object" && part in translation) {
        translation = (translation as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof translation === "string" ? translation : key;
  };

  const [formData, setFormData] = useState(() => {
    const d = initialClaim?.detail;
    return {
      guaranteeNo: initialClaim?.warrantyNo ?? "",
      dealer: d?.dealer ?? "",
      dealerCountry: d?.dealerCountry ?? "",
      dealerContact: d?.dealerContact ?? "",
      dealerPhone: d?.dealerPhone ?? "",
      dealerEmail: d?.dealerEmail ?? "",
      owner: d?.owner ?? "",
      ownerCountry: d?.ownerCountry ?? "",
      ownerAddress: d?.ownerAddress ?? "",
      ownerPostal: d?.ownerPostal ?? "",
      ownerPhone: "",
      ownerEmail: "",
      machineType: d?.machineType ?? "",
      serialNo: d?.serialNo ?? "",
      hours: d?.hours ?? "",
      saleDate: d?.saleDate ?? "",
      damageDate: d?.damageDate ?? "",
      approvedDate: d?.approvedDate ?? "",
      repairDate: d?.repairDate ?? "",
      faultDesc: d?.faultDesc ?? "",
      repairDesc: d?.repairDesc ?? "",
      parts: (d?.parts && d.parts.length > 0
        ? d.parts.map((p, idx) => ({ id: idx + 1, ...p }))
        : [
            { id: 1, qty: "1", partNo: "", desc: "", unitPrice: "" },
            { id: 2, qty: "1", partNo: "", desc: "", unitPrice: "" },
            { id: 3, qty: "1", partNo: "", desc: "", unitPrice: "" },
          ]) as PartLine[],
      laborHours: d?.laborHours ?? "0",
      drivingKm: d?.drivingKm ?? "0",
      currency: d?.currency ?? "DKK",
    };
  });

  const stepStatus = useMemo(() => {
    const hasGuarantee = !!formData.guaranteeNo.trim();
    const dealerComplete = !!(
      formData.dealer.trim() && formData.dealerPhone.trim()
    );
    const ownerComplete = !!(
      formData.owner.trim() && formData.ownerAddress.trim()
    );
    const machineComplete = !!(
      formData.machineType.trim() && formData.serialNo.trim()
    );
    const datesComplete = !!(formData.saleDate && formData.repairDate);
    const descComplete = !!(
      formData.faultDesc.trim() && formData.repairDesc.trim()
    );
    const partsComplete = !!(
      formData.laborHours !== "0" ||
      formData.parts.some((part) => part.desc.trim())
    );

    return {
      s1: hasGuarantee,
      s2: hasGuarantee,
      s3: dealerComplete && ownerComplete,
      s4: machineComplete,
      s5: datesComplete,
      s6: descComplete,
      s7: partsComplete,
      s8:
        hasGuarantee &&
        dealerComplete &&
        ownerComplete &&
        machineComplete &&
        datesComplete &&
        descComplete &&
        partsComplete,
    };
  }, [formData]);

  const totals = useMemo(() => {
    const partsTotal = formData.parts.reduce((acc, current) => {
      const qty = parseFloat(current.qty.replace(",", ".")) || 0;
      const unitPrice = parseFloat(current.unitPrice.replace(",", ".")) || 0;
      return acc + qty * unitPrice;
    }, 0);
    return { parts: partsTotal, grandTotal: partsTotal };
  }, [formData.parts]);

  const handlePrint = () => {
    if (!stepStatus.s8) {
      setShowErrors(true);
      return;
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const updatePart = (id: number, field: keyof PartLine, value: string) => {
    setFormData({
      ...formData,
      parts: formData.parts.map((part) =>
        part.id === id ? { ...part, [field]: value } : part,
      ),
    });
  };

  return (
    <div className="bg-white text-slate-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm no-print">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-slate-50 p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                {t("intro.title")}
              </h2>
            </div>
            <div className="p-8">
              <p className="mb-8 whitespace-pre-line leading-relaxed text-slate-600">
                {t("intro.body")}
              </p>
              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="w-full rounded-xl bg-green-700 py-4 font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-800"
              >
                {t("intro.ok")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language is controlled from the shared portal header */}

      {/* Stepper */}
      <div className="border-b bg-slate-900 py-4 shadow-inner no-print">
        <div className="scrollbar-hide mx-auto flex max-w-6xl items-center justify-between gap-4 overflow-x-auto px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
            const active = stepStatus[`s${num}` as keyof typeof stepStatus];
            return (
              <div
                key={num}
                className="flex shrink-0 items-center gap-3"
                style={{ opacity: active || num === 1 ? 1 : 0.4 }}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    active
                      ? "bg-green-500 shadow-lg shadow-green-900/40"
                      : "border border-slate-700 bg-slate-800 text-slate-500"
                  }`}
                >
                  {active ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-xs font-bold">{num}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-tight ${
                    active ? "text-white" : "text-slate-500"
                  }`}
                >
                  {t(`steps.s${num}`)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {readOnly && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 no-print">
            <AlertTriangle className="h-5 w-5 text-slate-500" />
            <p className="text-sm font-bold">
              Denne sag er låst og kan kun ses. Status tillader ikke redigering.
            </p>
          </div>
        )}
        {showErrors && !readOnly && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 no-print">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-bold">{t("validationError")}</p>
          </div>
        )}

        <fieldset disabled={readOnly} className="contents">

        <div className="rounded-2xl border border-slate-200 border-l-8 border-l-green-700 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-green-800">
            {t("labels.guaranteeNo")} *
          </label>
          <input
            className={`w-full rounded-xl border px-4 py-3 font-mono text-xl outline-none transition-all ${
              isFieldMissing(formData.guaranteeNo, true)
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-100"
            }`}
            placeholder="T-XXXXXX"
            value={formData.guaranteeNo}
            onChange={(event) =>
              setFormData({ ...formData, guaranteeNo: event.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-2">
          <SectionBox
            title={t("sections.dealer")}
            icon={<Wrench className="h-4 w-4" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label={t("labels.dealer")}
                value={formData.dealer}
                onChange={(value) => setFormData({ ...formData, dealer: value })}
                required
              />
              <FormInput
                label={t("labels.country")}
                value={formData.dealerCountry}
                onChange={(value) =>
                  setFormData({ ...formData, dealerCountry: value })
                }
                required
              />
              <FormInput
                label={t("labels.contact")}
                value={formData.dealerContact}
                onChange={(value) =>
                  setFormData({ ...formData, dealerContact: value })
                }
                required
              />
              <FormInput
                label={t("labels.phone")}
                value={formData.dealerPhone}
                onChange={(value) =>
                  setFormData({ ...formData, dealerPhone: value })
                }
                required
              />
            </div>
            <div className="mt-3">
              <FormInput
                label={t("labels.email")}
                value={formData.dealerEmail}
                onChange={(value) =>
                  setFormData({ ...formData, dealerEmail: value })
                }
                required
                type="email"
              />
            </div>
          </SectionBox>

          <SectionBox
            title={t("sections.owner")}
            icon={<User className="h-4 w-4" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label={t("labels.owner")}
                value={formData.owner}
                onChange={(value) => setFormData({ ...formData, owner: value })}
                required
              />
              <FormInput
                label={t("labels.country")}
                value={formData.ownerCountry}
                onChange={(value) =>
                  setFormData({ ...formData, ownerCountry: value })
                }
                required
              />
              <FormInput
                label={t("labels.address")}
                value={formData.ownerAddress}
                onChange={(value) =>
                  setFormData({ ...formData, ownerAddress: value })
                }
                required
              />
              <FormInput
                label={t("labels.postal")}
                value={formData.ownerPostal}
                onChange={(value) =>
                  setFormData({ ...formData, ownerPostal: value })
                }
                required
              />
            </div>
          </SectionBox>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-2">
          <SectionBox title={t("sections.machine")}>
            <FormInput
              label={t("labels.machineType")}
              value={formData.machineType}
              onChange={(value) =>
                setFormData({ ...formData, machineType: value })
              }
              required
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FormInput
                label={t("labels.serialNo")}
                value={formData.serialNo}
                onChange={(value) =>
                  setFormData({ ...formData, serialNo: value })
                }
                required
              />
              <FormInput
                label={t("labels.hours")}
                value={formData.hours}
                onChange={(value) => setFormData({ ...formData, hours: value })}
                required
              />
            </div>
          </SectionBox>

          <SectionBox title={t("sections.dates")}>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label={t("labels.saleDate")}
                type="date"
                value={formData.saleDate}
                onChange={(value) =>
                  setFormData({ ...formData, saleDate: value })
                }
                required
              />
              <FormInput
                label={t("labels.damageDate")}
                type="date"
                value={formData.damageDate}
                onChange={(value) =>
                  setFormData({ ...formData, damageDate: value })
                }
                required
              />
              <FormInput
                label={t("labels.approvedDate")}
                type="date"
                value={formData.approvedDate}
                onChange={(value) =>
                  setFormData({ ...formData, approvedDate: value })
                }
                required
              />
              <FormInput
                label={t("labels.repairDate")}
                type="date"
                value={formData.repairDate}
                onChange={(value) =>
                  setFormData({ ...formData, repairDate: value })
                }
                required
              />
            </div>
          </SectionBox>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-2">
          <TextAreaBox
            title={`${t("labels.faultDesc")} *`}
            value={formData.faultDesc}
            onChange={(value) => setFormData({ ...formData, faultDesc: value })}
            missing={isFieldMissing(formData.faultDesc, true)}
          />
          <TextAreaBox
            title={`${t("labels.repairDesc")} *`}
            value={formData.repairDesc}
            onChange={(value) => setFormData({ ...formData, repairDesc: value })}
            missing={isFieldMissing(formData.repairDesc, true)}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#111827] p-4 text-white print:border-b print:bg-white print:text-black">
            <h3 className="text-sm font-bold uppercase tracking-widest">
              {t("sections.parts")}
            </h3>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  parts: [
                    ...formData.parts,
                    {
                      id: Date.now(),
                      qty: "1",
                      partNo: "",
                      desc: "",
                      unitPrice: "",
                    },
                  ],
                })
              }
              className="rounded-full bg-green-600 p-1.5 transition-colors hover:bg-green-700 no-print"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50">
                <tr className="text-[10px] font-black uppercase text-slate-500">
                  <th className="w-20 px-4 py-3">{t("labels.qty")}</th>
                  <th className="w-40 px-4 py-3">{t("labels.partNo")}</th>
                  <th className="px-4 py-3">{t("labels.desc")}</th>
                  <th className="w-40 px-4 py-3 text-right">
                    {t("labels.unitPrice")}
                  </th>
                  <th className="w-40 px-4 py-3 text-right">
                    {t("labels.totalPrice")}
                  </th>
                  <th className="w-12 px-4 py-3 no-print" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.parts.map((part) => (
                  <tr
                    key={part.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <TableInput
                        value={part.qty}
                        onChange={(value) => updatePart(part.id, "qty", value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <TableInput
                        value={part.partNo}
                        onChange={(value) => updatePart(part.id, "partNo", value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <TableInput
                        value={part.desc}
                        onChange={(value) => updatePart(part.id, "desc", value)}
                        italic
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TableInput
                        value={part.unitPrice}
                        onChange={(value) =>
                          updatePart(part.id, "unitPrice", value)
                        }
                        alignRight
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">
                      {(
                        (parseFloat(part.qty.replace(",", ".")) || 0) *
                        (parseFloat(part.unitPrice.replace(",", ".")) || 0)
                      ).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center no-print">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            parts: formData.parts.filter(
                              (item) => item.id !== part.id,
                            ),
                          })
                        }
                        className="text-slate-300 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                label={t("labels.workingHours")}
                value={formData.laborHours}
                onChange={(value) =>
                  setFormData({ ...formData, laborHours: value })
                }
              />
              <FormInput
                label={t("labels.drivingKm")}
                value={formData.drivingKm}
                onChange={(value) =>
                  setFormData({ ...formData, drivingKm: value })
                }
              />
            </div>
            <p className="mt-8 text-[10px] font-bold italic leading-relaxed text-red-600 opacity-80">
              {t("labels.disclaimer")}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-b-8 border-green-600 bg-[#111827] p-8 text-white shadow-2xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-green-600/5 blur-2xl" />
            <div className="relative z-10 mb-8 flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-green-400">
                {t("sections.summary")}
              </span>
              <span className="rounded-lg bg-green-600 px-3 py-1 text-xs font-black shadow-lg shadow-green-900/40">
                {formData.currency}
              </span>
            </div>

            <div className="relative z-10 mb-8 space-y-4">
              <SummaryRow
                label={t("sections.parts")}
                value={totals.parts.toFixed(2)}
              />
              <SummaryRow
                label={t("labels.workingHours")}
                value={`${formData.laborHours || 0} h`}
              />
              <SummaryRow
                label={t("labels.summaryKm")}
                value={`${formData.drivingKm || 0} km`}
              />
            </div>

            <div className="relative z-10 border-t border-slate-800 pt-8 text-right">
              <span className="mb-2 block text-[11px] font-bold uppercase leading-none tracking-widest text-slate-500">
                {t("labels.totalSum")}
              </span>
              <span className="text-5xl font-black italic leading-none tracking-tighter text-white">
                {totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-8 no-print">
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className={`flex items-center gap-4 rounded-3xl px-16 py-6 font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              stepStatus.s8
                ? "bg-green-600 text-white shadow-2xl shadow-green-100 hover:-translate-y-1 hover:bg-green-700 active:scale-95"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {isPrinting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Printer className="h-6 w-6" />
            )}
            {t("labels.submit")}
          </button>
        </div>
      </main>

      <footer className="mx-auto mt-8 max-w-6xl border-t px-4 py-12 text-center text-slate-400 no-print">
        <p className="text-sm font-black uppercase italic tracking-tighter text-slate-800">
          <span className="text-red-600">TI</span>
          <span className="text-green-700">MAN</span> A/S
        </p>
        <p className="mt-1 text-xs">
          Osvald Pedersens Vej 2A-D, 6980 Tim - Danmark
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-green-700">
          <Phone className="h-4 w-4 text-red-600" />
          <span>Service - 96 74 44 66</span>
        </div>
      </footer>
    </div>
  );
}

export default ClaimTool;

function isFieldMissing(value: string, required?: boolean, type = "text") {
  if (!required) return false;
  if (!value || value.toString().trim() === "") return true;
  if (type === "email" && !value.includes("@")) return true;
  return false;
}

function SectionBox({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all print:border-none print:p-0 print:shadow-none">
      <h3 className="mb-4 flex items-center gap-2 border-b border-green-50 pb-2 text-xs font-black uppercase tracking-widest text-green-800 print:border-black print:text-black">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

function TextAreaBox({
  title,
  value,
  onChange,
  missing,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  missing?: boolean;
}) {
  return (
    <SectionBox title={title}>
      <textarea
        className={`h-32 w-full rounded-lg border p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-100 ${
          missing ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </SectionBox>
  );
}

function FormInput({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  const missing = isFieldMissing(value, required, type);
  return (
    <div className="w-full">
      <label className="mb-1 block text-[9px] font-bold uppercase text-slate-400 print:text-black">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
          missing
            ? "border-red-200 bg-red-50"
            : "border-slate-200 bg-slate-50 focus:border-green-600"
        } print:border-black print:bg-white`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TableInput({
  value,
  onChange,
  italic,
  alignRight,
}: {
  value: string;
  onChange: (value: string) => void;
  italic?: boolean;
  alignRight?: boolean;
}) {
  return (
    <input
      className={`w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 outline-none focus:border-green-600 ${
        italic ? "italic" : ""
      } ${alignRight ? "text-right" : ""}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-400">{label}</span>
      <span className="font-mono text-lg">{value}</span>
    </div>
  );
}
