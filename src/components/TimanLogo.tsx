import { cn } from "@/lib/utils";

interface TimanLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TimanLogo({ className, size = "md" }: TimanLogoProps) {
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-1.5 text-base",
    lg: "px-4 py-2 text-2xl",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-md bg-white border border-border-soft shadow-sm",
        sizes[size],
        className,
      )}
    >
      {/* green triangle accent on left */}
      <span
        aria-hidden
        className="mr-2 inline-block"
        style={{
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderLeft: "8px solid var(--timan-green)",
        }}
      />
      <span
        className="font-extrabold italic tracking-tight"
        style={{ color: "var(--timan-red)" }}
      >
        TIMAN
      </span>
    </div>
  );
}
