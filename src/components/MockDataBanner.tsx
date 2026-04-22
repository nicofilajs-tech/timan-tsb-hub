import { AlertTriangle } from "lucide-react";

interface MockDataBannerProps {
  /** Short, specific title — e.g. "Forhandlerlisten er preview-data". */
  title: string;
  /** Longer explanation of what is mocked and what the real source will be. */
  description: React.ReactNode;
}

/**
 * Yellow warning banner shown anywhere mock/preview data is rendered as if it
 * were real data. Keeps the UI honest until the real source sync is wired up.
 */
export function MockDataBanner({ title, description }: MockDataBannerProps) {
  return (
    <div
      className="mt-4 flex items-start gap-3 rounded-[10px] border bg-status-warning-bg p-4 shadow-sm"
      style={{ borderColor: "var(--status-warning-fg)" }}
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 flex-shrink-0"
        style={{ color: "var(--status-warning-fg)" }}
      />
      <div className="text-sm">
        <div
          className="font-semibold"
          style={{ color: "var(--status-warning-fg)" }}
        >
          {title}
        </div>
        <div className="mt-1 text-foreground/80">{description}</div>
      </div>
    </div>
  );
}
