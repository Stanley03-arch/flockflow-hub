import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { number, dateShort } from "@/lib/format";
import { useRole, can } from "@/lib/use-role";
import { toast } from "sonner";
import { Plus, X, Skull } from "lucide-react";

export const Route = createFileRoute("/_authenticated/batches")({
  component: BatchesPage,
});

function BatchesPage() {
  const { data: role } = useRole();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [mortalityFor, setMortalityFor] = useState<string | null>(null);

  const { data: batches } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("batches").select("*").order("acquired_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: mortality } = useQuery({
    queryKey: ["mortality-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mortality_records").select("batch_id, count");
      if (error) throw error;
      return data;
    },
  });

  const mortalityBy = (id: string) => (mortality ?? []).filter((m) => m.batch_id === id).reduce((s, m) => s + m.count, 0);

  return (
    <AppShell
      title="Flock Management"
      action={can(role, "manage") && <PrimaryButton onClick={() => setShowNew(true)}><Plus className="size-4" /> New batch</PrimaryButton>}
    >
      <Card title="Active batches" padding={false}>
        {!batches?.length ? (
          <EmptyState title="No batches yet" hint="Create your first batch to start tracking" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3">Breed</th>
                  <th className="px-5 py-3">Acquired</th>
                  <th className="px-5 py-3 text-right">Placed</th>
                  <th className="px-5 py-3 text-right">Lost</th>
                  <th className="px-5 py-3 text-right">Current</th>
                  <th className="px-5 py-3">Status</th>
                  {can(role, "manage") && <th className="px-5 py-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {batches.map((b) => {
                  const lost = mortalityBy(b.id);
                  return (
                    <tr key={b.id}>
                      <td className="px-5 py-3 font-semibold">{b.batch_code}</td>
                      <td className="px-5 py-3 text-brand-600">{b.breed}</td>
                      <td className="px-5 py-3 text-brand-600">{dateShort(b.acquired_date)}</td>
                      <td className="px-5 py-3 text-right">{number(b.initial_count)}</td>
                      <td className="px-5 py-3 text-right text-red-600">{number(lost)}</td>
                      <td className="px-5 py-3 text-right font-semibold">{number(b.initial_count - lost)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${b.status === "active" ? "bg-accent-emerald-50 text-accent-emerald-700" : "bg-surface-100 text-brand-600"}`}>{b.status}</span>
                      </td>
                      {can(role, "manage") && (
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setMortalityFor(b.id)} className="text-xs text-red-600 hover:underline font-medium inline-flex items-center gap-1">
                            <Skull className="size-3" /> Record loss
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showNew && <NewBatchModal onClose={() => setShowNew(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["batches"] }); setShowNew(false); }} />}
      {mortalityFor && <MortalityModal batchId={mortalityFor} onClose={() => setMortalityFor(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["mortality-all"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setMortalityFor(null); }} />}
    </AppShell>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h3 className="font-bold text-brand-900">{title}</h3>
          <button onClick={onClose}><X className="size-4 text-brand-400" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function NewBatchModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ batch_code: "", breed: "", initial_count: 100, acquired_date: new Date().toISOString().slice(0, 10), age_weeks_at_acquisition: 0 });
  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("batches").insert(form);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Batch created"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Modal title="New batch" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-3">
        <Field label="Batch code"><input required className={inputCls} value={form.batch_code} onChange={(e) => setForm({ ...form, batch_code: e.target.value })} placeholder="LY-2026-01" /></Field>
        <Field label="Breed"><input required className={inputCls} value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="Isa Brown" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Initial count"><input type="number" min={1} required className={inputCls} value={form.initial_count} onChange={(e) => setForm({ ...form, initial_count: +e.target.value })} /></Field>
          <Field label="Age (weeks)"><input type="number" min={0} className={inputCls} value={form.age_weeks_at_acquisition} onChange={(e) => setForm({ ...form, age_weeks_at_acquisition: +e.target.value })} /></Field>
        </div>
        <Field label="Acquired date"><input type="date" required className={inputCls} value={form.acquired_date} onChange={(e) => setForm({ ...form, acquired_date: e.target.value })} /></Field>
        <div className="flex gap-2 justify-end pt-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={mut.isPending}>Save</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function MortalityModal({ batchId, onClose, onSaved }: { batchId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ count: 1, type: "mortality", reason: "", record_date: new Date().toISOString().slice(0, 10) });
  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("mortality_records").insert({ batch_id: batchId, ...form });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Recorded"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Modal title="Record mortality / culling" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="mortality">Mortality</option>
              <option value="cull">Culled</option>
            </select>
          </Field>
          <Field label="Count"><input type="number" min={1} required className={inputCls} value={form.count} onChange={(e) => setForm({ ...form, count: +e.target.value })} /></Field>
        </div>
        <Field label="Date"><input type="date" required className={inputCls} value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} /></Field>
        <Field label="Reason"><input className={inputCls} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Disease, injury…" /></Field>
        <div className="flex gap-2 justify-end pt-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={mut.isPending}>Record</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
