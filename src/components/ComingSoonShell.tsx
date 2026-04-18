import { AppLayout } from "./AppLayout";

interface ComingSoonProps {
  variant: "dealer" | "admin";
  title: string;
  breadcrumbs: { label: string; to?: string }[];
}

export function ComingSoonShell({ variant, title, breadcrumbs }: ComingSoonProps) {
  const isDealer = variant === "dealer";
  return (
    <AppLayout
      variant={variant}
      company={isDealer ? "Nordic Machinery Aps" : "Intern"}
      user={
        isDealer
          ? { initials: "LJ", name: "Lars Jensen", role: "Dealer Admin" }
          : { initials: "TA", name: "Timan Admin", role: "Intern" }
      }
      breadcrumbs={breadcrumbs}
    >
      <h1 className="text-[22px] font-semibold" style={{ color: "var(--timan-red)" }}>
        {title}
      </h1>
      <div className="mt-5 rounded-[10px] border border-border-soft bg-white p-10 text-center shadow-sm">
        <div className="text-lg font-medium">Kommer snart</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Denne side er endnu ikke implementeret.
        </p>
      </div>
    </AppLayout>
  );
}
