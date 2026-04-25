/**
 * Mock claims store for the Dealer Claims portal (preview/demo).
 *
 * No backend yet — purely client-side fixture data.
 */

export type ClaimStatus =
  | "open"
  | "waiting"
  | "in_progress"
  | "approved"
  | "rejected"
  | "closed";

export interface ClaimPartLine {
  qty: string;
  partNo: string;
  desc: string;
  unitPrice: string; // DKK net
}

/** Full claim detail used to prefill the long claim form when opening/viewing. */
export interface ClaimDetail {
  /* Dealer */
  dealer: string;
  dealerCountry: string;
  dealerContact: string;
  dealerPhone: string;
  dealerEmail: string;
  /* Owner / customer */
  owner: string;
  ownerCountry: string;
  ownerAddress: string;
  ownerPostal: string;
  /* Machine */
  machineType: string;
  serialNo: string;
  hours: string;
  /* Dates (ISO yyyy-mm-dd) */
  saleDate: string;
  damageDate: string;
  approvedDate: string;
  repairDate: string;
  /* Descriptions */
  faultDesc: string;
  repairDesc: string;
  /* Parts & labor */
  parts: ClaimPartLine[];
  laborHours: string;
  drivingKm: string;
  currency: "DKK";
}

export interface ClaimRecord {
  id: string;
  /** Warranty / guarantee number issued by Timan, e.g. "T-001234". */
  warrantyNo: string;
  title: string;
  dealer: string;
  country: string;
  customer: string;
  machineType: string;
  serial: string;
  createdAt: string; // ISO date — submitted/created
  damageDate: string; // ISO date
  approvedDate: string | null; // ISO date or null
  /** Total claim amount in DKK (parts + labor). */
  totalPrice: number;
  status: ClaimStatus;
  /** Full detail used to prefill the claim form. */
  detail: ClaimDetail;
}

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  open: "Åben",
  waiting: "Afventer accept",
  in_progress: "I gang",
  approved: "Godkendt",
  rejected: "Afvist",
  closed: "Lukket",
};

/**
 * Whether the dealer is allowed to edit a claim in this status.
 * Editable: waiting (Afventer accept), in_progress (I gang).
 * Read-only: approved, rejected, closed (and legacy "open").
 */
export function isClaimEditable(status: ClaimStatus): boolean {
  return status === "waiting" || status === "in_progress";
}

const NORDIC_DEALER = "Nordic Machinery Aps";

const MOCK: ClaimRecord[] = [
  {
    id: "CL-9013",
    warrantyNo: "T-001931",
    title: "Hydraulik lækage — RC-1000",
    dealer: NORDIC_DEALER,
    country: "DK",
    customer: "Aalborg Park & Vej",
    machineType: "RC-1000",
    serial: "RC1000-22841",
    createdAt: "2026-04-18",
    damageDate: "2026-04-12",
    approvedDate: null,
    totalPrice: 8420,
    status: "waiting",
    detail: {
      dealer: NORDIC_DEALER,
      dealerCountry: "DK",
      dealerContact: "Mads Holm",
      dealerPhone: "+45 22 14 88 02",
      dealerEmail: "service@nordicmachinery.dk",
      owner: "Aalborg Park & Vej",
      ownerCountry: "DK",
      ownerAddress: "Industrivej 14",
      ownerPostal: "9000 Aalborg",
      machineType: "RC-1000",
      serialNo: "RC1000-22841",
      hours: "1284",
      saleDate: "2024-05-12",
      damageDate: "2026-04-12",
      approvedDate: "",
      repairDate: "2026-04-15",
      faultDesc:
        "Olielækage ved hovedhydraulikblok. Operatøren bemærkede tab af tryk og synligt oliesvind under arbejde.",
      repairDesc:
        "Demontering af hydraulikblok, udskiftning af pakningssæt og O-ringe. Trykprøvet ved 210 bar uden lækager.",
      parts: [
        { qty: "1", partNo: "HYD-PK-220", desc: "Pakningssæt hovedblok", unitPrice: "1450.00" },
        { qty: "4", partNo: "OR-18x2", desc: "O-ring 18x2 NBR", unitPrice: "45.00" },
        { qty: "6", partNo: "HYD-OIL-46", desc: "Hydraulikolie HVLP46 (l)", unitPrice: "85.00" },
      ],
      laborHours: "5.5",
      drivingKm: "62",
      currency: "DKK",
    },
  },
  {
    id: "CL-9001",
    warrantyNo: "T-001902",
    title: "Defekt startmotor",
    dealer: NORDIC_DEALER,
    country: "DK",
    customer: "Bygge A/S",
    machineType: "Timan 3330",
    serial: "T3330-19002",
    createdAt: "2026-04-12",
    damageDate: "2026-04-04",
    approvedDate: "2026-04-14",
    totalPrice: 14250,
    status: "in_progress",
    detail: {
      dealer: NORDIC_DEALER,
      dealerCountry: "DK",
      dealerContact: "Kristina Riis",
      dealerPhone: "+45 22 14 88 11",
      dealerEmail: "claims@nordicmachinery.dk",
      owner: "Bygge A/S",
      ownerCountry: "DK",
      ownerAddress: "Havnegade 7",
      ownerPostal: "5000 Odense",
      machineType: "Timan 3330",
      serialNo: "T3330-19002",
      hours: "2740",
      saleDate: "2023-09-04",
      damageDate: "2026-04-04",
      approvedDate: "2026-04-14",
      repairDate: "2026-04-16",
      faultDesc:
        "Maskinen vil ikke starte. Startmotor giver klikkende lyd uden træk på krumtap. Batteri og kabler testet OK.",
      repairDesc:
        "Udskiftning af defekt startmotor inkl. solenoide. Test af opstart 5 gange uden fejl.",
      parts: [
        { qty: "1", partNo: "ST-3330-A", desc: "Startmotor 12V 3kW", unitPrice: "8950.00" },
        { qty: "1", partNo: "BOLT-M10x40", desc: "Bolt M10x40 8.8 zink", unitPrice: "12.00" },
        { qty: "2", partNo: "WSH-M10", desc: "Spændeskive M10", unitPrice: "4.00" },
      ],
      laborHours: "3.0",
      drivingKm: "180",
      currency: "DKK",
    },
  },
  {
    id: "CL-8987",
    warrantyNo: "T-001877",
    title: "Knækket redskabsarm",
    dealer: "Skandinavisk Maskinservice AB",
    country: "SE",
    customer: "Entreprenør H. Olsen",
    machineType: "Tool-Trac",
    serial: "TT-44120",
    createdAt: "2026-04-05",
    damageDate: "2026-03-30",
    approvedDate: null,
    totalPrice: 21100,
    status: "waiting",
    detail: {
      dealer: "Skandinavisk Maskinservice AB",
      dealerCountry: "SE",
      dealerContact: "Jonas Berg",
      dealerPhone: "+46 31 88 22 04",
      dealerEmail: "service@skandmaskin.se",
      owner: "Entreprenör H. Olsen",
      ownerCountry: "SE",
      ownerAddress: "Storgatan 22",
      ownerPostal: "411 38 Göteborg",
      machineType: "Tool-Trac",
      serialNo: "TT-44120",
      hours: "3110",
      saleDate: "2022-06-18",
      damageDate: "2026-03-30",
      approvedDate: "",
      repairDate: "2026-04-02",
      faultDesc:
        "Redskabsarmen knækket ved svejsesamling under normal drift med standardredskab. Ingen overbelastning rapporteret.",
      repairDesc:
        "Udskiftning af komplet redskabsarm samt kontrol af monteringsbeslag. Ingen følgeskader.",
      parts: [
        { qty: "1", partNo: "TT-ARM-44", desc: "Redskabsarm komplet TT-44", unitPrice: "16800.00" },
        { qty: "2", partNo: "BUSH-30x40", desc: "Bøsning 30x40 bronze", unitPrice: "320.00" },
        { qty: "1", partNo: "GREASE-EP2", desc: "Smørefedt EP2 (kg)", unitPrice: "180.00" },
      ],
      laborHours: "6.5",
      drivingKm: "95",
      currency: "DKK",
    },
  },
  {
    id: "CL-8951",
    warrantyNo: "T-001841",
    title: "Display fejl efter softwareopdatering",
    dealer: "Bayern Garten- und Kommunaltechnik GmbH",
    country: "DE",
    customer: "Kommune Syd",
    machineType: "RC-1000s",
    serial: "RC1000S-31188",
    createdAt: "2026-03-28",
    damageDate: "2026-03-21",
    approvedDate: "2026-04-02",
    totalPrice: 5640,
    status: "approved",
    detail: {
      dealer: "Bayern Garten- und Kommunaltechnik GmbH",
      dealerCountry: "DE",
      dealerContact: "Andreas Wagner",
      dealerPhone: "+49 89 4488 1102",
      dealerEmail: "service@bayern-gk.de",
      owner: "Kommune Syd",
      ownerCountry: "DE",
      ownerAddress: "Rathausplatz 3",
      ownerPostal: "80331 München",
      machineType: "RC-1000s",
      serialNo: "RC1000S-31188",
      hours: "612",
      saleDate: "2025-02-10",
      damageDate: "2026-03-21",
      approvedDate: "2026-04-02",
      repairDate: "2026-04-05",
      faultDesc:
        "Display blevet sort efter softwareopdatering v3.4. Maskinen kører, men ingen menu eller diagnostik tilgængelig.",
      repairDesc:
        "Reflashet ECU med fabriksimage v3.3, efterfulgt af kontrolleret upgrade til v3.4.1. Display og menuer fungerer.",
      parts: [
        { qty: "1", partNo: "ECU-RC-S", desc: "ECU service kit RC-1000s", unitPrice: "3200.00" },
        { qty: "1", partNo: "CABLE-DIAG", desc: "Diagnose-kabel CAN", unitPrice: "640.00" },
      ],
      laborHours: "3.5",
      drivingKm: "44",
      currency: "DKK",
    },
  },
  {
    id: "CL-8902",
    warrantyNo: "T-001790",
    title: "Pumpedefekt under garanti",
    dealer: NORDIC_DEALER,
    country: "DK",
    customer: "Grus & Sand Aps",
    machineType: "Timan 3330",
    serial: "T3330-18733",
    createdAt: "2026-03-19",
    damageDate: "2026-03-12",
    approvedDate: "2026-03-25",
    totalPrice: 17890,
    status: "approved",
    detail: {
      dealer: NORDIC_DEALER,
      dealerCountry: "DK",
      dealerContact: "Mads Holm",
      dealerPhone: "+45 22 14 88 02",
      dealerEmail: "service@nordicmachinery.dk",
      owner: "Grus & Sand Aps",
      ownerCountry: "DK",
      ownerAddress: "Sandvej 88",
      ownerPostal: "8700 Horsens",
      machineType: "Timan 3330",
      serialNo: "T3330-18733",
      hours: "1980",
      saleDate: "2024-01-22",
      damageDate: "2026-03-12",
      approvedDate: "2026-03-25",
      repairDate: "2026-03-28",
      faultDesc:
        "Hovedhydraulikpumpe lækker olie og leverer ikke fuldt tryk. Operatør rapporterer tab af løftekraft.",
      repairDesc:
        "Udskiftet hovedpumpe og hydraulikfilter. System trykprøvet og funktionstestet ved fuld belastning.",
      parts: [
        { qty: "1", partNo: "PUMP-3330-HD", desc: "Hovedhydraulikpumpe HD", unitPrice: "13200.00" },
        { qty: "1", partNo: "FLT-HYD-10", desc: "Hydraulikfilter 10 micron", unitPrice: "420.00" },
        { qty: "10", partNo: "HYD-OIL-46", desc: "Hydraulikolie HVLP46 (l)", unitPrice: "85.00" },
      ],
      laborHours: "4.5",
      drivingKm: "120",
      currency: "DKK",
    },
  },
  {
    id: "CL-8870",
    warrantyNo: "T-001755",
    title: "Manglende dokumentation — afvist",
    dealer: "Suomi Konepalvelut Oy",
    country: "FI",
    customer: "Landbrug Nord",
    machineType: "RC-751",
    serial: "RC751-12044",
    createdAt: "2026-03-08",
    damageDate: "2026-02-28",
    approvedDate: null,
    totalPrice: 9300,
    status: "rejected",
    detail: {
      dealer: "Suomi Konepalvelut Oy",
      dealerCountry: "FI",
      dealerContact: "Mika Korhonen",
      dealerPhone: "+358 9 4412 008",
      dealerEmail: "huolto@konepalvelut.fi",
      owner: "Landbrug Nord",
      ownerCountry: "FI",
      ownerAddress: "Maatie 5",
      ownerPostal: "00100 Helsinki",
      machineType: "RC-751",
      serialNo: "RC751-12044",
      hours: "4200",
      saleDate: "2021-08-10",
      damageDate: "2026-02-28",
      approvedDate: "",
      repairDate: "2026-03-04",
      faultDesc:
        "Defekt transmission. Reklamation afvist pga. manglende serviceintervaldokumentation og udløbet garanti.",
      repairDesc:
        "Reparation udført efter aftale med ejer for egen regning. Transmissionsolie og tætninger udskiftet.",
      parts: [
        { qty: "1", partNo: "TR-SEAL-751", desc: "Transmissionstætning sæt", unitPrice: "2400.00" },
        { qty: "8", partNo: "TR-OIL-80W", desc: "Transmissionsolie 80W (l)", unitPrice: "120.00" },
      ],
      laborHours: "5.0",
      drivingKm: "210",
      currency: "DKK",
    },
  },
  {
    id: "CL-8801",
    warrantyNo: "T-001702",
    title: "Defekt gearkasse",
    dealer: NORDIC_DEALER,
    country: "DK",
    customer: "Park & Anlæg I/S",
    machineType: "Timan 3330",
    serial: "T3330-17440",
    createdAt: "2026-02-22",
    damageDate: "2026-02-15",
    approvedDate: "2026-03-02",
    totalPrice: 26500,
    status: "closed",
    detail: {
      dealer: NORDIC_DEALER,
      dealerCountry: "DK",
      dealerContact: "Kristina Riis",
      dealerPhone: "+45 22 14 88 11",
      dealerEmail: "claims@nordicmachinery.dk",
      owner: "Park & Anlæg I/S",
      ownerCountry: "DK",
      ownerAddress: "Skovbrynet 41",
      ownerPostal: "2800 Kongens Lyngby",
      machineType: "Timan 3330",
      serialNo: "T3330-17440",
      hours: "3120",
      saleDate: "2022-11-30",
      damageDate: "2026-02-15",
      approvedDate: "2026-03-02",
      repairDate: "2026-03-06",
      faultDesc:
        "Gearkassen springer ud af 2. gear under belastning. Mislyde hørt fra gearkasse ved skift.",
      repairDesc:
        "Komplet udskiftning af gearkasse til nyt fabriksaggregat. Ny olie, kontrol af monteringsbeslag.",
      parts: [
        { qty: "1", partNo: "GBX-3330-FAB", desc: "Gearkasse 3330 fabriksny", unitPrice: "21800.00" },
        { qty: "1", partNo: "GBX-MNT-KIT", desc: "Monteringskit gearkasse", unitPrice: "1450.00" },
        { qty: "6", partNo: "GBX-OIL-75", desc: "Gearolie 75W-90 (l)", unitPrice: "140.00" },
      ],
      laborHours: "8.0",
      drivingKm: "150",
      currency: "DKK",
    },
  },
  {
    id: "CL-8775",
    warrantyNo: "T-001688",
    title: "Hydraulikslange sprunget",
    dealer: "Skandinavisk Maskinservice AB",
    country: "SE",
    customer: "Aarhus Kommune",
    machineType: "RC-1000",
    serial: "RC1000-21992",
    createdAt: "2026-02-09",
    damageDate: "2026-02-01",
    approvedDate: "2026-02-15",
    totalPrice: 4280,
    status: "closed",
    detail: {
      dealer: "Skandinavisk Maskinservice AB",
      dealerCountry: "SE",
      dealerContact: "Jonas Berg",
      dealerPhone: "+46 31 88 22 04",
      dealerEmail: "service@skandmaskin.se",
      owner: "Aarhus Kommune",
      ownerCountry: "DK",
      ownerAddress: "Rådhuspladsen 2",
      ownerPostal: "8000 Aarhus C",
      machineType: "RC-1000",
      serialNo: "RC1000-21992",
      hours: "1820",
      saleDate: "2024-04-08",
      damageDate: "2026-02-01",
      approvedDate: "2026-02-15",
      repairDate: "2026-02-18",
      faultDesc:
        "Hydraulikslange til løftearm sprunget under drift. Ingen følgeskader på cylinder eller ventil.",
      repairDesc:
        "Ny hydraulikslange monteret, system aftappet og påfyldt. Trykprøvet og funktionstestet.",
      parts: [
        { qty: "1", partNo: "HOSE-3/8-1500", desc: "Hydraulikslange 3/8\" 1500mm", unitPrice: "1850.00" },
        { qty: "2", partNo: "FIT-3/8-JIC", desc: "Fitting 3/8\" JIC", unitPrice: "240.00" },
        { qty: "5", partNo: "HYD-OIL-46", desc: "Hydraulikolie HVLP46 (l)", unitPrice: "85.00" },
      ],
      laborHours: "2.0",
      drivingKm: "55",
      currency: "DKK",
    },
  },
];

export function getAllClaims(): ClaimRecord[] {
  return MOCK;
}

export function getClaimById(id: string): ClaimRecord | undefined {
  return MOCK.find((c) => c.id === id);
}

export function getDealerClaims(dealerName: string): ClaimRecord[] {
  if (!dealerName) return MOCK;
  const needle = dealerName.toLowerCase();
  const scoped = MOCK.filter((c) => c.dealer.toLowerCase() === needle);
  // In preview, if the current dealer has no records yet, fall back to the
  // demo dealer so the page is not empty.
  return scoped.length > 0 ? scoped : MOCK.filter((c) => c.dealer === NORDIC_DEALER);
}

export interface DealerClaimsSummary {
  total: number;
  open: number; // open + waiting + in_progress
  approved: number;
  rejected: number;
  latest: ClaimRecord[];
}

export function summarizeDealerClaims(records: ClaimRecord[]): DealerClaimsSummary {
  const open = records.filter(
    (r) => r.status === "open" || r.status === "waiting" || r.status === "in_progress",
  ).length;
  const approved = records.filter((r) => r.status === "approved").length;
  const rejected = records.filter((r) => r.status === "rejected").length;
  const latest = [...records]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  return { total: records.length, open, approved, rejected, latest };
}

export interface AdminClaimsSummary {
  total: number;
  open: number;
  approved: number;
  totalAmount: number;
}

export function summarizeAdminClaims(records: ClaimRecord[]): AdminClaimsSummary {
  const open = records.filter(
    (r) => r.status === "open" || r.status === "waiting" || r.status === "in_progress",
  ).length;
  const approved = records.filter((r) => r.status === "approved").length;
  const totalAmount = records.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  return { total: records.length, open, approved, totalAmount };
}

export function formatDkk(amount: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
}
