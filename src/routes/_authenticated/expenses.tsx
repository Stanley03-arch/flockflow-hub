import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { currency, dateShort } from "@/lib/format";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => (await supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(200)).data ?? [],
  });

  const total = (expenses ?? []).reduce((s, e: any) => s + Number(e.amount), 0);

  return (
    <AppShell title="Expenses" action={<PrimaryButton onClick={() => setShowNew(true)}><Plus className="size-4" /> New expense</PrimaryButton>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total (last 200)"><p className="text-2xl font-bold text-red-600">{currency(total)}</p></Card>
      </div>
      <Card title="Recent expenses" padding={false}>
        {!expenses?.length ? <EmptyState title="No expenses yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                <th className="px-5 py-3">Date</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Description</th><th className="px-5 py-3 text-right">Amount</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100">
                {expenses.map((e: any) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3">{dateShort(e.expense_date)}</td>
                    <td className="px-5 py-3 capitalize text-brand-600">{e.category}</td>
                    <td className="px-5 py-3 text-brand-600">{e.description ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-red-600">{currency(Number(e.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {showNew && <NewExpenseModal onClose={() => setShowNew(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["expenses"] }); setShowNew(false); }} />}
    </AppShell>
  );
}

function NewExpenseModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ expense_date: new Date().toISOString().slice(0, 10), category: "feed", description: "", amount: 0 });
  const mut = useMutation({ mutationFn: async () => { const { error } = await supabase.from("expenses").insert(form); if (error) throw error; }, onSuccess: () => { toast.success("Recorded"); onSaved(); }, onError: (e: any) => toast.error(e.message) });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100"><h3 className="font-bold text-brand-900">New expense</h3><button onClick={onClose}><X className="size-4 text-brand-400" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <Field label="Date"><input type="date" required className={inputCls} value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} /></Field>
          <Field label="Category"><select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="feed">Feed</option><option value="medicine">Medicine</option><option value="salaries">Salaries</option><option value="equipment">Equipment</option><option value="other">Other</option>
          </select></Field>
          <Field label="Description"><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Amount"><input type="number" min={0} step="0.01" required className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></Field>
          <div className="flex gap-2 justify-end pt-2"><GhostButton onClick={onClose}>Cancel</GhostButton><PrimaryButton type="submit" disabled={mut.isPending}>Save</PrimaryButton></div>
        </form>
      </div>
    </div>
  );
}
