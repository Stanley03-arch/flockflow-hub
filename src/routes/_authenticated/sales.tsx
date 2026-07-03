import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, PrimaryButton, GhostButton, Field, inputCls, EmptyState } from "@/components/ui-kit";
import { currency, number, dateShort } from "@/lib/format";
import { useRole, can } from "@/lib/use-role";
import { toast } from "sonner";
import { Plus, X, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sales")({
  component: SalesPage,
});

function SalesPage() {
  const { data: role } = useRole();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: sales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("*, customers(name)").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const printReceipt = (s: any) => {
    const w = window.open("", "_blank", "width=420,height=600");
    if (!w) return;
    w.document.write(`<html><head><title>Receipt ${s.receipt_no}</title>
      <style>body{font-family:ui-sans-serif,system-ui;padding:24px;color:#0f172a}h1{font-size:16px;margin:0 0 4px}small{color:#64748b}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:6px 0;font-size:12px;border-bottom:1px solid #e2e8f0;text-align:left}.total{font-weight:700;border-top:2px solid #0f172a;padding-top:8px;margin-top:8px;display:flex;justify-content:space-between}</style>
      </head><body>
      <h1>OvaTrack Pro — Sales Receipt</h1>
      <small>Receipt ${s.receipt_no}</small><br/>
      <small>${dateShort(s.sale_date)}</small>
      <table><tr><th>Customer</th><td>${s.customers?.name ?? "Walk-in"}</td></tr>
      <tr><th>Quantity</th><td>${s.quantity} ${s.unit}</td></tr>
      <tr><th>Unit price</th><td>${currency(Number(s.price_per_unit))}</td></tr></table>
      <div class="total"><span>Total</span><span>${currency(Number(s.total_amount))}</span></div>
      <p style="margin-top:32px;font-size:11px;color:#94a3b8">Thank you for your business.</p>
      <script>window.print();</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <AppShell
      title="Sales & Orders"
      action={can(role, "sell") && <PrimaryButton onClick={() => setShowNew(true)}><Plus className="size-4" /> New sale</PrimaryButton>}
    >
      <Card title="All sales" padding={false}>
        {!sales?.length ? (
          <EmptyState title="No sales yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Receipt</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3 text-right">Unit price</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {sales.map((s: any) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-mono text-xs">{s.receipt_no}</td>
                    <td className="px-5 py-3">{dateShort(s.sale_date)}</td>
                    <td className="px-5 py-3">{s.customers?.name ?? "Walk-in"}</td>
                    <td className="px-5 py-3 text-right">{number(s.quantity)} {s.unit}</td>
                    <td className="px-5 py-3 text-right">{currency(Number(s.price_per_unit))}</td>
                    <td className="px-5 py-3 text-right font-semibold">{currency(Number(s.total_amount))}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => printReceipt(s)} className="text-brand-600 hover:text-brand-900 inline-flex items-center gap-1 text-xs font-medium"><Printer className="size-3" /> Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showNew && <NewSaleModal onClose={() => setShowNew(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["sales"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setShowNew(false); }} />}
    </AppShell>
  );
}

function NewSaleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ customer_id: "", sale_date: new Date().toISOString().slice(0, 10), quantity: 1, unit: "crate", price_per_unit: 0, notes: "" });
  const { data: customers } = useQuery({
    queryKey: ["customers-select"],
    queryFn: async () => (await supabase.from("customers").select("id, name").order("name")).data ?? [],
  });
  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sales").insert({ ...form, customer_id: form.customer_id || null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Sale recorded"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl border border-surface-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h3 className="font-bold text-brand-900">New sale</h3>
          <button onClick={onClose}><X className="size-4 text-brand-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="p-5 space-y-3">
          <Field label="Customer">
            <select className={inputCls} value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Walk-in</option>
              {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Date"><input type="date" required className={inputCls} value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Quantity"><input type="number" min={1} required className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} /></Field>
            <Field label="Unit">
              <select className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="crate">Crate</option>
                <option value="tray">Tray</option>
                <option value="egg">Egg</option>
              </select>
            </Field>
            <Field label="Unit price"><input type="number" min={0} step="0.01" required className={inputCls} value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: +e.target.value })} /></Field>
          </div>
          <div className="text-sm text-brand-700 bg-surface-50 rounded-lg p-3 flex justify-between">
            <span>Total</span><span className="font-bold">{currency(form.quantity * form.price_per_unit)}</span>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={mut.isPending}>Save & print</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
