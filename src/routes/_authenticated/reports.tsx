import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, GhostButton, Field, inputCls } from "@/components/ui-kit";
import { StatCard } from "@/components/ui-kit";
import { currency, number, dateShort } from "@/lib/format";
import { Download } from "lucide-react";
import { useRole, can } from "@/lib/use-role";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: role } = useRole();
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const { data } = useQuery({
    queryKey: ["reports", from, to],
    queryFn: async () => {
      const [eggs, sales, expenses, mortality] = await Promise.all([
        supabase.from("egg_production").select("*").gte("record_date", from).lte("record_date", to),
        supabase.from("sales").select("*, customers(name)").gte("sale_date", from).lte("sale_date", to),
        supabase.from("expenses").select("*").gte("expense_date", from).lte("expense_date", to),
        supabase.from("mortality_records").select("*").gte("record_date", from).lte("record_date", to),
      ]);
      const totalEggs = (eggs.data ?? []).reduce((s, r) => s + r.eggs_collected, 0);
      const goodEggs = (eggs.data ?? []).reduce((s, r) => s + (r.eggs_collected - r.cracked_eggs - r.damaged_eggs), 0);
      const totalRevenue = (sales.data ?? []).reduce((s, r) => s + Number(r.total_amount), 0);
      const totalExpenses = (expenses.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
      const totalMortality = (mortality.data ?? []).reduce((s, r) => s + r.count, 0);
      return {
        totalEggs, goodEggs, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, totalMortality,
        sales: sales.data ?? [], expenses: expenses.data ?? [],
      };
    },
  });

  const exportCsv = (rows: any[], name: string) => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object");
    const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}_${from}_${to}.csv`;
    a.click();
  };

  return (
    <AppShell title="Reports & Analytics">
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <Field label="From"><input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Eggs collected" value={number(data?.totalEggs)} sub={`${number(data?.goodEggs)} good`} />
        <StatCard label="Mortality" value={number(data?.totalMortality)} tone="danger" />
        {can(role, "view_finance") && <StatCard label="Total revenue" value={currency(data?.totalRevenue)} tone="good" />}
        {can(role, "view_finance") && <StatCard label="Net profit" value={currency(data?.netProfit)} tone={(data?.netProfit ?? 0) >= 0 ? "good" : "danger"} sub={`${currency(data?.totalExpenses)} expenses`} />}
      </div>

      <Card title="Sales report" action={<GhostButton onClick={() => exportCsv(data?.sales ?? [], "sales")}><Download className="size-4" /> CSV</GhostButton>} padding={false}>
        {!data?.sales.length ? <div className="p-8 text-center text-brand-400 text-sm">No sales in range.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Receipt</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
            <tbody className="divide-y divide-surface-100">{data.sales.map((s: any) => (
              <tr key={s.id}><td className="px-5 py-3">{dateShort(s.sale_date)}</td><td className="px-5 py-3 font-mono text-xs">{s.receipt_no}</td><td className="px-5 py-3">{s.customers?.name ?? "Walk-in"}</td><td className="px-5 py-3 text-right font-semibold">{currency(Number(s.total_amount))}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>

      {can(role, "view_finance") && (
        <Card title="Expense report" action={<GhostButton onClick={() => exportCsv(data?.expenses ?? [], "expenses")}><Download className="size-4" /> CSV</GhostButton>} padding={false}>
          {!data?.expenses.length ? <div className="p-8 text-center text-brand-400 text-sm">No expenses in range.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead><tr className="bg-surface-50 text-[11px] font-bold text-brand-400 uppercase tracking-wider"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Description</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-surface-100">{data.expenses.map((e: any) => (
                <tr key={e.id}><td className="px-5 py-3">{dateShort(e.expense_date)}</td><td className="px-5 py-3 capitalize">{e.category}</td><td className="px-5 py-3">{e.description ?? "—"}</td><td className="px-5 py-3 text-right font-semibold text-red-600">{currency(Number(e.amount))}</td></tr>
              ))}</tbody>
            </table></div>
          )}
        </Card>
      )}
    </AppShell>
  );
}
