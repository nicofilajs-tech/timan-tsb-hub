import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log ind — TSB Portal" },
      { name: "description", content: "Log ind på Timan TSB Portal" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithMicrosoft, currentUser, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Redirect når session + profil er hentet (fx ved allerede-logget-ind eller efter login)
  useEffect(() => {
    if (!isLoading && currentUser) {
      const target = isAdminRole(currentUser.role) ? "/admin/dashboard" : "/dashboard";
      navigate({ to: target });
    }
  }, [currentUser, isLoading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Redirect sker via useEffect når onAuthStateChange opdaterer currentUser
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login mislykkedes";
      if (
        message.includes("Invalid login credentials") ||
        message.includes("invalid_grant")
      ) {
        setFieldError("Forkert e-mail eller adgangskode. Prøv igen.");
      } else if (message.includes("Email not confirmed")) {
        setFieldError("Din e-mailadresse er ikke bekræftet endnu.");
      } else {
        setFieldError("Der opstod en fejl. Prøv venligst igen.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMicrosoftLogin = async () => {
    try {
      await loginWithMicrosoft();
    } catch {
      toast.info("Microsoft SSO kommer snart", {
        description: "Log ind med e-mail og adgangskode i mellemtiden.",
      });
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
        Log ind på TSB Portal
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Velkommen tilbage. Indtast dine oplysninger.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="navn@firma.dk"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Adgangskode</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />
        </div>

        {fieldError && (
          <p className="rounded-md bg-status-danger-bg px-3 py-2 text-sm text-status-danger-fg">
            {fieldError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logger ind..." : "Log ind"}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-soft" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground">eller</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={onMicrosoftLogin}
          disabled={isSubmitting}
        >
          <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden>
            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
            <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
            <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
            <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
          </svg>
          Log ind med Microsoft
        </Button>

        <div className="pt-2 text-center">
          <a
            href="/reset-password"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--timan-green)" }}
          >
            Glemt adgangskode?
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
