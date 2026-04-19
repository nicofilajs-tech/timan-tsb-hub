import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Sæt til true for sider der kræver timan_admin / super_admin / timan_support */
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { session, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (adminOnly && currentUser && !isAdminRole(currentUser.role)) {
      navigate({ to: "/dashboard" });
    }
  }, [session, currentUser, isLoading, adminOnly, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-bg">
        <div className="text-sm text-muted-foreground">Indlæser...</div>
      </div>
    );
  }

  if (!session) return null;
  if (adminOnly && currentUser && !isAdminRole(currentUser.role)) return null;

  return <>{children}</>;
}
