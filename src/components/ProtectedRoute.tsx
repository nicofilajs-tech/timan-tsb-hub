import { useEffect } from "react";
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

  const previewBypassEnabled = isPreviewAuthBypassEnabled();
  const previewUser = previewBypassEnabled ? getPreviewUser() : null;
  const effectiveUser = currentUser ?? previewUser;
  const hasSession = Boolean(session) || previewBypassEnabled;
  const hasAdminAccess = !adminOnly || isAdminRole(effectiveUser?.role ?? null);

  useEffect(() => {
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
    session,
    currentUser,
    isLoading,
    adminOnly,
    navigate,
    previewBypassEnabled,
    hasAdminAccess,
  ]);

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
