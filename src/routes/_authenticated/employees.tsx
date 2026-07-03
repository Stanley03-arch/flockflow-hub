import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { currency } from "@/lib/format";
import { useRole, can } from "@/lib/use-role";
import { toast } from "sonner";
import { Plus, X, Check, Minus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const { data: role } = useRole();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await supabase.from("employees").select("*").order("full_name")).data ?? [],
  });
  const { data: attToday } = useQuery({
    queryKey: ["attendance-today", today],
    queryFn: async () => (await supabase.from("attendance").select("*").eq("record_date", today)).data ?? [],
  });

  const markAttendance = useMutation({
    mutationFn: async ({ employee_id, status }: { employee_id: string; status: string }) => {
      const existing = attToday?.find((a) => a.employee_id === employee_id);
      if (existing) {
        const { error } = await supabase.from("attendance").update({ status }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").insert({ employee_id, record_date: today, status });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance-today"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const getStatus = (id: string) => attToday?.find((a) => a.employee_id === id)?.status;

  return (
    <AppShell title="Employees & Attendance" action={can(role, "manage") && <PrimaryButton onClick={() => setShowNew(true)}><Plus className="size-4" /> New employee</PrimaryButton>}>
      <Card title="Roster & today's attendance" padding={false}>
        {!employees?.length ? (
          <EmptyState title="No employees yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                <th className="px-5 py-3">Name</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Duties</th>
                {can(role, "view_finance") && <th className="px-5 py-3 text-right">Salary</th>}
                <th className="px-5 py-3 text-center">Today</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100">
                {employees.map((e: any) => {
                  const st = getStatus(e.id);
                  return (
                    <tr key={e.id}>
                      <td className="px-5 py-3 font-semibold">{e.full_name}</td>
                      <td className="px-5 py-3 text-brand-600">{e.job_title ?? "—"}</td>
                      <td className="px-5 py-3 text-brand-600 text-xs">{e.assigned_duties ?? "—"}</td>
                      {can(role, "view_finance") && <td className="px-5 py-3 text-right">{e.salary ? currency(Number(e.salary)) : "—"}</td>}
                      <td className="px-5 py-3 text-center">
                        {can(role, "manage") ? (
                          <div className="inline-flex gap-1">
                            {(["present", "late", "absent"] as const).map((s) => (
                              <button key={s} onClick={() => markAttendance.mutate({ employee_id: e.id, status: s })}
                                className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${st === s ? (s === "present" ? "bg-accent-emerald-600 text-white" : s === "late" ? "bg-amber-500 text-white" : "bg-red-600 text-white") : "bg-surface-100 text-brand-600 hover:bg-surface-200"}`}>{s.charAt(0)}</button>
                            ))}
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${st === "present" ? "bg-accent-emerald-50 text-accent-emerald-700" : st === "late" ? "bg-amber-50 text-amber-700" : st === "absent" ? "bg-red-50 text-red-700" : "bg-surface-100 text-brand-400"}`}>{st ?? "—"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {showNew && <NewEmpModal role={role} onClose={() => setShowNew(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["employees"] }); setShowNew(false); }} />}
    </AppShell>
  );
}

function NewEmpModal({ role, onClose, onSaved }: { role?: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", job_title: "", assigned_duties: "", salary: 0 });
  const mut = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form };
      if (!payload.salary) delete payload.salary;
      const { error } = await supabase.from("employees").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Employee added"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100"><h3 className="font-bold text-brand-900">New employee</h3><button onClick={onClose}><X className="size-4 text-brand-400" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <Field label="Full name"><input required className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <Field label="Job title"><input className={inputCls} value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Farm hand, Feed manager…" /></Field>
          <Field label="Assigned duties"><input className={inputCls} value={form.assigned_duties} onChange={(e) => setForm({ ...form, assigned_duties: e.target.value })} /></Field>
          {(role === "admin" || role === "manager") && (
            <Field label="Monthly salary (optional)"><input type="number" min={0} step="0.01" className={inputCls} value={form.salary} onChange={(e) => setForm({ ...form, salary: +e.target.value })} /></Field>
          )}
          <div className="flex gap-2 justify-end pt-2"><GhostButton onClick={onClose}>Cancel</GhostButton><PrimaryButton type="submit" disabled={mut.isPending}>Save</PrimaryButton></div>
        </form>
      </div>
    </div>
  );
}
