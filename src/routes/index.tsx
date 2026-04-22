import { createFileRoute, redirect } from "@tanstack/react-router";
import { getPreviewRole, isPreviewAuthBypassEnabled, PREVIEW_ROLES } from "@/lib/preview-auth";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // 🔴 TEMPORARY PREVIEW-ONLY AUTH BYPASS — skip /login entirely in Lovable preview / dev.
    // Landing target depends on the currently-selected preview role.
    // In production this guard is false, so the normal /login redirect is preserved.
    if (isPreviewAuthBypassEnabled()) {
      const role = getPreviewRole();
      const target = isAdminRole(PREVIEW_ROLES[role].user.role)
        ? "/admin/dashboard"
        : "/dashboard";
      throw redirect({ to: target });
    }
    throw redirect({ to: "/login" });
  },
});
