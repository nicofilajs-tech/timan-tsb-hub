import { TimanLogo } from "./TimanLogo";

interface BrandHeaderProps {
  subtitle?: string;
}

export function BrandHeader({ subtitle }: BrandHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <TimanLogo size="sm" />
      <div className="leading-tight">
        <div className="text-[18px] font-semibold" style={{ color: "var(--timan-red)" }}>
          TSB Portal
        </div>
        {subtitle ? (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}
