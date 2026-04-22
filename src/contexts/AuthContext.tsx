import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AppUser, RoleCode } from "@/lib/auth";
// 🔴 TEMPORARY: preview-only auth bypass — remove before production launch
import {
  getPreviewUser,
  isPreviewAuthBypassEnabled,
  subscribePreviewRole,
} from "@/lib/preview-auth";

interface AuthContextValue {
  session: Session | null;
  currentUser: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserProfile(userId: string): Promise<AppUser | null> {
  // NOTE: `users` and `user_roles` tables don't exist yet in the database.
  // Cast to `any` until the schema is created via a migration and types are regenerated.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: userData, error: userError } = await db
    .from("users")
    .select("id, email, full_name, company_name")
    .eq("id", userId)
    .maybeSingle();

  if (userError || !userData) return null;

  const { data: roleData } = await db
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", userId)
    .maybeSingle();

  const nested = roleData?.roles as { code: RoleCode } | null | undefined;
  const role = nested?.code ?? null;

  return {
    id: userData.id as string,
    email: userData.email as string,
    fullName: (userData.full_name as string | null) ?? null,
    companyName: (userData.company_name as string | null) ?? null,
    role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 🔴 TEMPORARY PREVIEW-ONLY AUTH BYPASS — guarded so it never runs in production.
    // Allows visual UI work in Lovable preview without a real Supabase login.
    // Also reacts to role changes from the PreviewRoleSwitcher.
    if (isPreviewAuthBypassEnabled()) {
      const applyPreviewUser = () => {
        const previewUser = getPreviewUser();
        setSession({ user: { id: previewUser.id } } as unknown as Session);
        setCurrentUser(previewUser);
      };
      applyPreviewUser();
      setIsLoading(false);
      const unsub = subscribePreviewRole(() => applyPreviewUser());
      return unsub;
    }

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        const profile = await fetchUserProfile(initialSession.user.id);
        setCurrentUser(profile);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const profile = await fetchUserProfile(newSession.user.id);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function loginWithMicrosoft(): Promise<void> {
    // Placeholder — kræver Entra-app konfiguration i Supabase
    throw new Error("Microsoft SSO er ikke aktiveret endnu");
  }

  return (
    <AuthContext.Provider value={{ session, currentUser, isLoading, login, logout, loginWithMicrosoft }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth skal bruges inden for AuthProvider");
  return ctx;
}
