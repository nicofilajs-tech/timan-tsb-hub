import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/tsb")({
  component: AdminTsbLayout,
});

function AdminTsbLayout() {
  return <Outlet />;
}
