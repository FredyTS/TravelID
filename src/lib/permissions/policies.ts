import { adminRoles } from "@/lib/auth/roles";

export function isAdminRole(role?: string | null) {
  return role ? adminRoles.includes(role as (typeof adminRoles)[number]) : false;
}

export function canAccessCustomerResource(
  sessionCustomerId?: string | null,
  ownerCustomerId?: string | null,
) {
  return Boolean(sessionCustomerId && ownerCustomerId && sessionCustomerId === ownerCustomerId);
}
