import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { number } from "@/lib/format";
import { useRole, can } from "@/lib/use-role";
import { toast } from "sonner";
import { Plus, X, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { data: role } = useRole();
  const qc = useQueryClient();
  const [showNewItem, setShowNewItem] = useState(false);
  const [moveFor, setMoveFor] = useState<any | null>(null);

  const { data: items } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => (await supabase.from("inventory_items").select("*").order("category").order("name")).data ?? [],
  });

  return (
    <AppShell title="Feed & Inventory" action={can(role, "manage") && <PrimaryButton onClick={() => setShowNewItem(true)}><Plus className="size-4" /> New item</PrimaryButton>}>
      <Card title="Stock levels" padding={false}>
        {!items?.length ? (
          <EmptyState title="No inventory items yet" hint="Add feed, medicine, vaccines, and supplies" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                <th className="px-5 py-3">Item</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Stock</th><th className="px-5 py-3 text-right">Low threshold</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-surface-100">
                {items.map((i: any) => {
                  const low = Number(i.quantity) <= Number(i.low_stock_threshold);
                  return (
                    <tr key={i.id}>
                      <td className="px-5 py-3 font-semibold">{i.name}</td>
                      <td className="px-5 py-3 text-brand-600 capitalize">{i.category}</td>
                      <td className="px-5 py-3 text-right font-semibold">{number(Number(i.quantity))} {i.unit}</td>
                      <td className="px-5 py-3 text-right text-brand-500">{number(Number(i.low_stock_threshold))} {i.unit}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${low ? "bg-amber-50 text-amber-700" : "bg-accent-emerald-50 text-accent-emerald-700"}`}>{low ? "Low" : "OK"}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {can(role, "manage") && (
                          <button onClick={() => setMoveFor(i)} className="text-xs text-accent-emerald-700 hover:underline font-medium inline-flex items-center gap-1"><ArrowUpDown className="size-3" /> Move</button>
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
      {showNewItem && <NewItemModal onClose={() => setShowNewItem(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["inventory"] }); setShowNewItem(false); }} />}
      {moveFor && <MoveModal item={moveFor} onClose={() => setMoveFor(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["inventory"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setMoveFor(null); }} />}
    </AppShell>
  );
}

function NewItemModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", category: "feed", unit: "kg", quantity: 0, low_stock_threshold: 0, supplier: "" });
  const mut = useMutation({ mutationFn: async () => { const { error } = await supabase.from("inventory_items").insert(form); if (error) throw error; }, onSuccess: () => { toast.success("Item added"); onSaved(); }, onError: (e: any) => toast.error(e.message) });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100"><h3 className="font-bold text-brand-900">New inventory item</h3><button onClick={onClose}><X className="size-4 text-brand-400" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <Field label="Name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="feed">Feed</option><option value="medicine">Medicine</option><option value="vaccine">Vaccine</option><option value="cleaning">Cleaning</option><option value="equipment">Equipment</option>
            </select></Field>
            <Field label="Unit"><input required className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, bag, liter…" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starting qty"><input type="number" min={0} step="0.01" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} /></Field>
            <Field label="Low threshold"><input type="number" min={0} step="0.01" className={inputCls} value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: +e.target.value })} /></Field>
          </div>
          <Field label="Supplier"><input className={inputCls} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
          <div className="flex gap-2 justify-end pt-2"><GhostButton onClick={onClose}>Cancel</GhostButton><PrimaryButton type="submit" disabled={mut.isPending}>Save</PrimaryButton></div>
        </form>
      </div>
    </div>
  );
}

function MoveModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ type: "purchase", quantity: 0, unit_cost: 0, supplier: "", notes: "" });
  const mut = useMutation({
    mutationFn: async () => {
      const signed = form.type === "purchase" ? Math.abs(form.quantity) : -Math.abs(form.quantity);
      const { error } = await supabase.from("inventory_movements").insert({
        item_id: item.id, type: form.type, quantity: signed, unit_cost: form.unit_cost || null, supplier: form.supplier || null, notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Recorded"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100"><h3 className="font-bold text-brand-900">Stock movement — {item.name}</h3><button onClick={onClose}><X className="size-4 text-brand-400" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="purchase">Purchase (add)</option><option value="usage">Usage (subtract)</option><option value="adjustment">Adjustment</option>
            </select></Field>
            <Field label={`Quantity (${item.unit})`}><input type="number" min={0} step="0.01" required className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} /></Field>
          </div>
          {form.type === "purchase" && (
            <>
              <Field label="Unit cost"><input type="number" min={0} step="0.01" className={inputCls} value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: +e.target.value })} /></Field>
              <Field label="Supplier"><input className={inputCls} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
            </>
          )}
          <Field label="Notes"><input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="flex gap-2 justify-end pt-2"><GhostButton onClick={onClose}>Cancel</GhostButton><PrimaryButton type="submit" disabled={mut.isPending}>Record</PrimaryButton></div>
        </form>
      </div>
    </div>
  );
}
