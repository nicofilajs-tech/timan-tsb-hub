export type RoleCode =
  | "super_admin"
  | "timan_admin"
  | "timan_support"
  | "dealer_admin"
  | "dealer_user";

export const ADMIN_ROLES: RoleCode[] = ["super_admin", "timan_admin", "timan_support"];

export interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  role: RoleCode | null;
}

export function isAdminRole(role: RoleCode | null): boolean {
  return role !== null && ADMIN_ROLES.includes(role);
}
