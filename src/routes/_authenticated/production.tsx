import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { number, dateShort } from "@/lib/format";
import { useRole, can } from "@/lib/use-role";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/production")({
  component: ProductionPage,
});

function ProductionPage() {
  const { data: role } = useRole();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: records } = useQuery({
    queryKey: ["egg-production"],
    queryFn: async () => {
      const { data, error } = await supabase.from("egg_production").select("*, batches(batch_code)").order("record_date", { ascending: false }).limit(60);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell
      title="Egg Production"
      action={can(role, "manage") && <PrimaryButton onClick={() => setShowNew(true)}><Plus className="size-4" /> Record entry</PrimaryButton>}
    >
      <Card title="Daily entries" padding={false}>
        {!records?.length ? (
          <EmptyState title="No entries yet" hint="Record your first daily egg collection" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3 text-right">Collected</th>
                  <th className="px-5 py-3 text-right">Cracked</th>
                  <th className="px-5 py-3 text-right">Damaged</th>
                  <th className="px-5 py-3 text-right">Good</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {records.map((r: any) => {
                  const good = r.eggs_collected - r.cracked_eggs - r.damaged_eggs;
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-medium">{dateShort(r.record_date)}</td>
                      <td className="px-5 py-3 text-brand-600">{r.batches?.batch_code ?? "—"}</td>
                      <td className="px-5 py-3 text-right">{number(r.eggs_collected)}</td>
                      <td className="px-5 py-3 text-right text-amber-600">{number(r.cracked_eggs)}</td>
                      <td className="px-5 py-3 text-right text-red-600">{number(r.damaged_eggs)}</td>
                      <td className="px-5 py-3 text-right font-bold text-accent-emerald-700">{number(good)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showNew && <NewEntryModal onClose={() => setShowNew(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["egg-production"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setShowNew(false); }} />}
    </AppShell>
  );
}

function NewEntryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ record_date: new Date().toISOString().slice(0, 10), batch_id: "", eggs_collected: 0, cracked_eggs: 0, damaged_eggs: 0 });
  const { data: batches } = useQuery({
    queryKey: ["batches-select"],
    queryFn: async () => {
      const { data } = await supabase.from("batches").select("id, batch_code").eq("status", "active");
      return data ?? [];
    },
  });
  const mut = useMutation({
    mutationFn: async () => {
      const payload = { ...form, batch_id: form.batch_id || null };
      const { error } = await supabase.from("egg_production").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Recorded"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h3 className="font-bold text-brand-900">Daily egg entry</h3>
          <button onClick={onClose}><X className="size-4 text-brand-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <Field label="Date"><input type="date" required className={inputCls} value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} /></Field>
          <Field label="Batch (optional)">
            <select className={inputCls} value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })}>
              <option value="">All / not specified</option>
              {batches?.map((b) => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
            </select>
          </Field>
          <Field label="Eggs collected"><input type="number" min={0} required className={inputCls} value={form.eggs_collected} onChange={(e) => setForm({ ...form, eggs_collected: +e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cracked"><input type="number" min={0} className={inputCls} value={form.cracked_eggs} onChange={(e) => setForm({ ...form, cracked_eggs: +e.target.value })} /></Field>
            <Field label="Damaged"><input type="number" min={0} className={inputCls} value={form.damaged_eggs} onChange={(e) => setForm({ ...form, damaged_eggs: +e.target.value })} /></Field>
          </div>
          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-brand-600">Good eggs: <span className="font-bold text-accent-emerald-700">{form.eggs_collected - form.cracked_eggs - form.damaged_eggs}</span></span>
            <div className="flex gap-2">
              <GhostButton onClick={onClose}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={mut.isPending}>Save</PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
