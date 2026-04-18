import { cn } from "@/lib/utils";

type Tone = "default" | "warning" | "danger";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  className?: string;
}

export function StatCard({ label, value, tone = "default", className }: StatCardProps) {
  const toneClasses: Record<Tone, string> = {
    default: "border-border-soft",
    warning: "",
    danger: "",
  };

  const valueColor: Record<Tone, string> = {
    default: "text-foreground",
    warning: "",
    danger: "",
  };

  const style: React.CSSProperties = {};
  if (tone === "warning") {
    style.borderColor = "#FCD34D";
    style.color = "#92400E";
  } else if (tone === "danger") {
    style.borderColor = "#FCA5A5";
    style.color = "#991B1B";
  }

  return (
    <div
      className={cn(
        "rounded-[10px] border bg-white p-5 shadow-sm",
        toneClasses[tone],
        className,
      )}
      style={tone !== "default" ? { borderColor: style.borderColor } : undefined}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn("mt-2 text-3xl font-semibold", valueColor[tone])}
        style={tone !== "default" ? { color: style.color } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
