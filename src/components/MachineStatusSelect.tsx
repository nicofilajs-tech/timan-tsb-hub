import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MACHINE_STATUS_LABEL,
  MACHINE_STATUS_OPTIONS,
  type MachineStatus,
} from "@/lib/dealer-status";

/**
 * Dealer-side per-machine status dropdown.
 *
 * Colors are mandated by spec:
 *  - Afventer / ikke startet → RED
 *  - I gang / Aktiv          → YELLOW
 *  - Udført / Færdig         → GREEN
 */
const TONE: Record<
  MachineStatus,
  { trigger: string; dot: string }
> = {
  afventer: {
    trigger: "bg-status-danger-bg text-status-danger-fg",
    dot: "bg-status-danger-fg",
  },
  i_gang: {
    trigger: "bg-status-warning-bg text-status-warning-fg",
    dot: "bg-status-warning-fg",
  },
  udfoert: {
    trigger: "bg-status-success-bg text-status-success-fg",
    dot: "bg-status-success-fg",
  },
};

interface MachineStatusSelectProps {
  value: MachineStatus;
  onChange: (next: MachineStatus) => void;
  className?: string;
}

export function MachineStatusSelect({
  value,
  onChange,
  className,
}: MachineStatusSelectProps) {
  const tone = TONE[value];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as MachineStatus)}>
      <SelectTrigger
        className={cn(
          "h-8 w-auto min-w-[190px] gap-2 whitespace-nowrap rounded-full border-0 px-3 text-xs font-medium shadow-none",
          tone.trigger,
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MACHINE_STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s} className="whitespace-nowrap text-sm">
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", TONE[s].dot)} />
              {MACHINE_STATUS_LABEL[s]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
