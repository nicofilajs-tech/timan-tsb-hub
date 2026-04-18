import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
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
          />
        </div>

        <Button type="submit" className="w-full">
          Log ind
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-soft" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground">eller</span>
          </div>
        </div>

        <Button type="button" variant="secondary" className="w-full">
          <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden>
            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
            <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
            <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
            <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
          </svg>
          Log ind med Microsoft
        </Button>

        <div className="pt-2 text-center">
          <Link
            to="/reset-password"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--timan-green)" }}
          >
            Glemt adgangskode?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
