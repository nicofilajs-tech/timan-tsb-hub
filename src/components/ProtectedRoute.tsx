import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/auth";
import { getPreviewUser, isPreviewAuthBypassEnabled } from "@/lib/preview-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Sæt til true for sider der kræver timan_admin / super_admin / timan_support */
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { session, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  // Defer all client-only state (preview-auth bypass reads localStorage / window)
  // to after hydration to avoid SSR/CSR mismatches.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const previewBypassEnabled = hydrated && isPreviewAuthBypassEnabled();
  const previewUser = previewBypassEnabled ? getPreviewUser() : null;
  const effectiveUser = currentUser ?? previewUser;
  const hasSession = Boolean(session) || previewBypassEnabled;
  const hasAdminAccess = !adminOnly || isAdminRole(effectiveUser?.role ?? null);

  useEffect(() => {
    if (!hydrated) return;
    if (previewBypassEnabled) {
      if (adminOnly && !hasAdminAccess) {
        navigate({ to: "/dashboard" });
      }
      return;
    }

    if (isLoading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (adminOnly && currentUser && !isAdminRole(currentUser.role)) {
      navigate({ to: "/dashboard" });
    }
  }, [
    hydrated,
    session,
    currentUser,
    isLoading,
    adminOnly,
    navigate,
    previewBypassEnabled,
    hasAdminAccess,
  ]);

  // During SSR and the first client paint, render children optimistically so
  // the server HTML matches the client HTML. Real auth gating runs in the
  // effect above on the client.
  if (!hydrated) return <>{children}</>;

  if (!previewBypassEnabled && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-bg">
        <div className="text-sm text-muted-foreground">Indlæser...</div>
      </div>
    );
  }

  if (!hasSession) return null;
  if (!hasAdminAccess) return null;

  return <>{children}</>;
}
