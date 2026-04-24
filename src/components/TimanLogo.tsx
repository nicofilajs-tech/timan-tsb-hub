import { cn } from "@/lib/utils";
import timanLogo from "@/assets/timan-logo.png";

interface TimanLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TimanLogo({ className, size = "md" }: TimanLogoProps) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  return (
    <img
      src={timanLogo}
      alt="Timan"
      className={cn("w-auto object-contain", sizes[size], className)}
    />
  );
}
