export const roleLabels = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  AGENT: "Agente",
  CLIENT: "Cliente",
} as const;

export const adminRoles = ["SUPERADMIN", "ADMIN", "AGENT"] as const;

export type AppRole = keyof typeof roleLabels;
