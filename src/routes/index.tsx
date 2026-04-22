import { createFileRoute, redirect } from "@tanstack/react-router";
import { isPreviewAuthBypassEnabled } from "@/lib/preview-auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // 🔴 TEMPORARY PREVIEW-ONLY AUTH BYPASS — skip /login entirely in Lovable preview / dev.
    // In production this guard is false, so the normal /login redirect is preserved.
    if (isPreviewAuthBypassEnabled()) {
      throw redirect({ to: "/admin/dashboard" });
    }
    throw redirect({ to: "/login" });
  },
});
