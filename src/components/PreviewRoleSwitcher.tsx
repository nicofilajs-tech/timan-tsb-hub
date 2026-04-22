/**
 * 🔴 TEMPORARY PREVIEW-ONLY ROLE SWITCHER
 * Renders only when isPreviewAuthBypassEnabled() is true.
 * Lets designers swap between Timan Admin / Dealer Admin / Dealer User
 * to review layouts without a real login.
 *
 * Remove this component (and its mount in __root.tsx) before production.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import {
  PREVIEW_ROLES,
  type PreviewRoleCode,
  getPreviewRole,
  isPreviewAuthBypassEnabled,
  setPreviewRole,
  subscribePreviewRole,
} from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function PreviewRoleSwitcher() {
  const [enabled, setEnabled] = useState(false);
  const [role, setRole] = useState<PreviewRoleCode>("timan_admin");
  const navigate = useNavigate();

  // Initialise on client only (SSR-safe)
  useEffect(() => {
    if (!isPreviewAuthBypassEnabled()) return;
    setEnabled(true);
    setRole(getPreviewRole());
    const unsub = subscribePreviewRole((r) => setRole(r));
    return unsub;
  }, []);

  if (!enabled) return null;

  const handleSelect = (next: PreviewRoleCode) => {
    if (next === role) return;
    setPreviewRole(next);
    setRole(next);
    // Send the user to the natural landing page for the new role
    const target = isAdminRole(PREVIEW_ROLES[next].user.role)
      ? "/admin/dashboard"
      : "/dashboard";
    navigate({ to: target });
  };

  return (
    <>
      {/* Bottom-right switcher with inline preview indicator */}
      <div className="fixed bottom-4 right-4 z-[60] rounded-xl border border-border-soft bg-white/95 p-2 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Eye className="h-3 w-3" />
          Preview rolle
        </div>
        <div className="flex flex-col gap-1">
          {(Object.keys(PREVIEW_ROLES) as PreviewRoleCode[]).map((code) => {
            const def = PREVIEW_ROLES[code];
            const active = code === role;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  active
                    ? "bg-status-success-bg text-status-success-fg"
                    : "text-foreground hover:bg-page-bg",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    active ? "bg-status-success-fg" : "bg-muted-foreground/40",
                  )}
                />
                {def.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
