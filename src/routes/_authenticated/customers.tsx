import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { useRole, can } from "@/lib/use-role";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { data: role } = useRole();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*, sales(total_amount)").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell title="Customers" action={can(role, "sell") && <PrimaryButton onClick={() => setShowNew(true)}><Plus className="size-4" /> New customer</PrimaryButton>}>
      <Card title="Directory" padding={false}>
        {!customers?.length ? (
          <EmptyState title="No customers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                <th className="px-5 py-3">Name</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Email</th><th className="px-5 py-3 text-right">Sales</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100">
                {customers.map((c: any) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-semibold">{c.name}</td>
                    <td className="px-5 py-3 text-brand-600">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-brand-600">{c.email ?? "—"}</td>
                    <td className="px-5 py-3 text-right">{c.sales?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {showNew && <NewCustomerModal onClose={() => setShowNew(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["customers"] }); setShowNew(false); }} />}
    </AppShell>
  );
}

function NewCustomerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const mut = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("customers").insert(form); if (error) throw error; },
    onSuccess: () => { toast.success("Customer added"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100"><h3 className="font-bold text-brand-900">New customer</h3><button onClick={onClose}><X className="size-4 text-brand-400" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <Field label="Name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Address"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="flex gap-2 justify-end pt-2"><GhostButton onClick={onClose}>Cancel</GhostButton><PrimaryButton type="submit" disabled={mut.isPending}>Save</PrimaryButton></div>
        </form>
      </div>
    </div>
  );
}
