import { cn } from "@/lib/utils";
import {
  DEALER_CASE_STATUS_LABEL,
  DEALER_CASE_STATUS_SHORT_LABEL,
  type DealerCaseStatus,
} from "@/lib/dealer-status";

/**
 * Overall dealer-side TSB case status badge.
 *
 *  - ny_frigivet     → yellow / warning (action required: accept receipt)
 *  - accepteret_info → blue / info       (received, work not started)
 *  - aktiv           → green / success   (work running)
 */
const TONE: Record<DealerCaseStatus, string> = {
  ny_frigivet: "bg-status-warning-bg text-status-warning-fg",
  accepteret_info: "bg-status-info-bg text-status-info-fg",
  aktiv: "bg-status-success-bg text-status-success-fg",
};

interface DealerCaseStatusBadgeProps {
  status: DealerCaseStatus;
  /** "full" uses the long label, "short" uses the compact one for tables. */
  variant?: "full" | "short";
  size?: "sm" | "md";
  className?: string;
}

export function DealerCaseStatusBadge({
  status,
  variant = "full",
  size = "md",
  className,
}: DealerCaseStatusBadgeProps) {
  const label =
    variant === "short"
      ? DEALER_CASE_STATUS_SHORT_LABEL[status]
      : DEALER_CASE_STATUS_LABEL[status];

  const sizeCls =
    size === "sm"
      ? "px-3 py-1 text-[11px]"
      : "px-4 py-1.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center whitespace-nowrap rounded-full font-semibold uppercase tracking-wide",
        TONE[status],
        sizeCls,
        className,
      )}
    >
      {label}
    </span>
  );
}
