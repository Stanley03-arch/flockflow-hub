import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "sales" | "worker";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
}

export function useRole() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AppRole> => {
      if (!user) return "worker";
      const { data, error } = await supabase.rpc("get_user_role", { _user_id: user.id });
      if (error || !data) return "worker";
      return data as AppRole;
    },
  });
}

export const roleLabel: Record<AppRole, string> = {
  admin: "Administrator",
  manager: "Farm Manager",
  sales: "Sales Officer",
  worker: "Farm Worker",
};

export function can(role: AppRole | undefined, action: "manage" | "sell" | "view_finance" | "admin"): boolean {
  if (!role) return false;
  if (action === "admin") return role === "admin";
  if (action === "view_finance") return role === "admin" || role === "manager";
  if (action === "manage") return role === "admin" || role === "manager";
  if (action === "sell") return role === "admin" || role === "manager" || role === "sales";
  return false;
}
