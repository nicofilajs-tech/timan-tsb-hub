/**
 * Mock claims store for the Dealer Claims portal (preview/demo).
 *
 * No backend yet — purely client-side fixture data. New claims created via
 * the form (currently the existing ClaimTool) are NOT yet persisted here;
 * this store only powers Dashboard + "Mine claims" for the dealer.
 */

export type ClaimStatus =
  | "open"
  | "waiting"
  | "in_progress"
  | "approved"
  | "rejected"
  | "closed";

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
}

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  open: "Åben",
  waiting: "Afventer accept",
  in_progress: "I gang",
  approved: "Godkendt",
  rejected: "Afvist",
  closed: "Lukket",
};

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
    status: "open",
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
    status: "approved",
  },
];

export function getAllClaims(): ClaimRecord[] {
  return MOCK;
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
