/**
 * Dealer-side status models.
 *
 * Two clearly separated levels — never mix these with the Timan-Admin
 * process status (`ProcessStatus` in tsb-store.ts).
 *
 *   A) DealerCaseStatus  — overall status of a TSB case in the dealer portal
 *   B) MachineStatus     — status of a single machine row inside that TSB
 */

/** Overall TSB case status as seen by the dealer. */
export type DealerCaseStatus =
  /** New TSB released — dealer must accept receipt. */
  | "ny_frigivet"
  /** Dealer has accepted/confirmed receipt of the TSB info; work not started. */
  | "accepteret_info"
  /** Work on the TSB is active/running. */
  | "aktiv";

export const DEALER_CASE_STATUS_LABEL: Record<DealerCaseStatus, string> = {
  ny_frigivet: "NY TSB FRIGIVET — HUSK AT ACCEPTERE MODTAGELSEN",
  accepteret_info: "Accepteret TSB informationen",
  aktiv: "Aktiv",
};

/** Short label variant for tight spaces (table cells). */
export const DEALER_CASE_STATUS_SHORT_LABEL: Record<DealerCaseStatus, string> = {
  ny_frigivet: "Ny TSB — accepter modtagelse",
  accepteret_info: "Accepteret TSB info",
  aktiv: "Aktiv",
};

/** Machine-level status inside a TSB. */
export type MachineStatus =
  | "afventer"   // not started yet  → red
  | "i_gang"     // in progress      → yellow
  | "udfoert";   // done             → green

export const MACHINE_STATUS_LABEL: Record<MachineStatus, string> = {
  afventer: "Afventer / ikke startet",
  i_gang: "I gang / Aktiv",
  udfoert: "Udført / Færdig",
};

export const MACHINE_STATUS_OPTIONS: MachineStatus[] = [
  "afventer",
  "i_gang",
  "udfoert",
];
