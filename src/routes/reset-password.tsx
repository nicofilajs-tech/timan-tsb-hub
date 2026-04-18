import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/AuthLayout";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <AuthLayout>
      <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
        Nulstil adgangskode
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Kommer snart. Kontakt din administrator hvis du har brug for hjælp.
      </p>
      <div className="mt-6">
        <Link
          to="/login"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--timan-green)" }}
        >
          ← Tilbage til log ind
        </Link>
      </div>
    </AuthLayout>
  );
}
