import "./i18n";
import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="max-w-md rounded-[10px] border border-border-soft bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold" style={{ color: "var(--timan-red)" }}>
          Noget gik galt
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Der opstod en uventet fejl. Prøv venligst igen.
        </p>
        {import.meta.env.DEV && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-page-bg p-3 text-left font-mono text-xs">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-[8px] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Prøv igen
          </button>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });
  return router;
};
