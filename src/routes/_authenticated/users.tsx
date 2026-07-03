import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState } from "@/components/ui-kit";
import { useRole, roleLabel, type AppRole } from "@/lib/use-role";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

function UsersPage() {
  const { data: role } = useRole();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => { if (role && role !== "admin") nav({ to: "/dashboard", replace: true }); }, [role, nav]);

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap: Record<string, AppRole[]> = {};
      (roles.data ?? []).forEach((r) => { roleMap[r.user_id] = [...(roleMap[r.user_id] ?? []), r.role as AppRole]; });
      return (profiles.data ?? []).map((p) => ({ ...p, roles: roleMap[p.id] ?? [] }));
    },
    enabled: role === "admin",
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["all-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (role !== "admin") return null;

  return (
    <AppShell title="Users & Settings">
      <Card title="Team members" padding={false}>
        {!users?.length ? <EmptyState title="No users yet" /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
              <th className="px-5 py-3">Email</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Role</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-semibold">{u.email}</td>
                  <td className="px-5 py-3 text-brand-600">{u.full_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.roles[0] ?? "worker"}
                      onChange={(e) => setRole.mutate({ userId: u.id, newRole: e.target.value as AppRole })}
                      className="text-xs border border-surface-200 rounded-md px-2 py-1 bg-white font-medium"
                    >
                      {(["admin","manager","sales","worker"] as AppRole[]).map((r) => (
                        <option key={r} value={r}>{roleLabel[r]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>

      <Card title="How to add a user">
        <p className="text-sm text-brand-600 leading-relaxed">
          New team members sign up at the login screen. Once they've created an account, you can assign them the correct role above. The first account created on this system automatically becomes the Administrator.
        </p>
      </Card>
    </AppShell>
  );
}
