/**
 * Resolve the active dealer name (used to scope warranty records to the
 * dealer in dealer-portal pages). Falls back to the preview user company in
 * preview/dev environments.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPreviewUser, isPreviewAuthBypassEnabled } from "@/lib/preview-auth";

export function useDealerName(): string {
  const { currentUser } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (currentUser?.companyName) return currentUser.companyName;
  if (!hydrated) return "";
  if (isPreviewAuthBypassEnabled()) {
    return getPreviewUser().companyName ?? "";
  }
  return "";
}
