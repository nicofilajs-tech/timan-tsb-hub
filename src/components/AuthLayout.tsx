import { BrandHeader } from "@/components/BrandHeader";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandHeader />
        </div>
        <div className="rounded-[10px] border border-border-soft bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
