import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface PageBackLinkProps {
  to: string;
  label?: string;
}

/**
 * Standard "← Tilbage til dashboard" link rendered at the top of
 * module pages, just below the shared PortalHeader.
 */
export function PageBackLink({ to, label = "Tilbage til dashboard" }: PageBackLinkProps) {
  return (
    <Link
      to={to as "/dashboard"}
      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
