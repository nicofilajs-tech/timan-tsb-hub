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
  title: string;
  customer: string;
  machineType: string;
  serial: string;
  createdAt: string; // ISO date
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
    title: "Hydraulik lækage — RC-1000",
    customer: "Aalborg Park & Vej",
    machineType: "RC-1000",
    serial: "RC1000-22841",
    createdAt: "2026-04-18",
    status: "waiting",
  },
  {
    id: "CL-9001",
    title: "Defekt startmotor",
    customer: "Bygge A/S",
    machineType: "Timan 3330",
    serial: "T3330-19002",
    createdAt: "2026-04-12",
    status: "in_progress",
  },
  {
    id: "CL-8987",
    title: "Knækket redskabsarm",
    customer: "Entreprenør H. Olsen",
    machineType: "Tool-Trac",
    serial: "TT-44120",
    createdAt: "2026-04-05",
    status: "open",
  },
  {
    id: "CL-8951",
    title: "Display fejl efter softwareopdatering",
    customer: "Kommune Syd",
    machineType: "RC-1000s",
    serial: "RC1000S-31188",
    createdAt: "2026-03-28",
    status: "approved",
  },
  {
    id: "CL-8902",
    title: "Pumpedefekt under garanti",
    customer: "Grus & Sand Aps",
    machineType: "Timan 3330",
    serial: "T3330-18733",
    createdAt: "2026-03-19",
    status: "approved",
  },
  {
    id: "CL-8870",
    title: "Manglende dokumentation — afvist",
    customer: "Landbrug Nord",
    machineType: "RC-751",
    serial: "RC751-12044",
    createdAt: "2026-03-08",
    status: "rejected",
  },
  {
    id: "CL-8801",
    title: "Defekt gearkasse",
    customer: "Park & Anlæg I/S",
    machineType: "Timan 3330",
    serial: "T3330-17440",
    createdAt: "2026-02-22",
    status: "closed",
  },
  {
    id: "CL-8775",
    title: "Hydraulikslange sprunget",
    customer: "Aarhus Kommune",
    machineType: "RC-1000",
    serial: "RC1000-21992",
    createdAt: "2026-02-09",
    status: "approved",
  },
];

export function getDealerClaims(_dealerName: string): ClaimRecord[] {
  // Preview only: every dealer sees the same demo set.
  return MOCK;
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
