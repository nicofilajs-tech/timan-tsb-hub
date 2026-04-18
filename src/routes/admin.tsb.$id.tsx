import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonShell } from "@/components/ComingSoonShell";

export const Route = createFileRoute("/admin/tsb/$id")({
  component: TsbDetail,
});

function TsbDetail() {
  const { id } = Route.useParams();
  return (
    <ComingSoonShell
      variant="admin"
      title={id}
      breadcrumbs={[
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "TSB'er", to: "/admin/tsb" },
        { label: id },
      ]}
    />
  );
}
