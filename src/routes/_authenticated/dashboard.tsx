import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { StatCard, Card, EmptyState } from "@/components/ui-kit";
import { currency, number, dateShort } from "@/lib/format";
import { useRole, can } from "@/lib/use-role";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: role } = useRole();
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ["dashboard", today],
    queryFn: async () => {
      const [batches, mortality, eggsToday, eggs30, salesToday, salesWeek, lowStock, recentSales] = await Promise.all([
        supabase.from("batches").select("initial_count").eq("status", "active"),
        supabase.from("mortality_records").select("count, record_date").gte("record_date", monthAgo),
        supabase.from("egg_production").select("eggs_collected, cracked_eggs, damaged_eggs").eq("record_date", today),
        supabase.from("egg_production").select("record_date, eggs_collected, cracked_eggs, damaged_eggs").gte("record_date", monthAgo).order("record_date"),
        supabase.from("sales").select("total_amount").eq("sale_date", today),
        supabase.from("sales").select("total_amount, sale_date").gte("sale_date", weekAgo),
        supabase.from("inventory_items").select("id, name, quantity, unit, low_stock_threshold"),
        supabase.from("sales").select("id, receipt_no, sale_date, quantity, unit, total_amount, status, customers(name)").order("created_at", { ascending: false }).limit(5),
      ]);

      const initTotal = (batches.data ?? []).reduce((s, b) => s + b.initial_count, 0);
      const totalMortality = (mortality.data ?? []).reduce((s, r) => s + r.count, 0);
      const mortalityWeek = (mortality.data ?? []).filter((r) => r.record_date >= weekAgo).reduce((s, r) => s + r.count, 0);
      const population = initTotal - totalMortality;

      const t = eggsToday.data?.[0];
      const todayGood = t ? t.eggs_collected - t.cracked_eggs - t.damaged_eggs : 0;
      const layingRate = population > 0 && t ? Math.round((t.eggs_collected / population) * 1000) / 10 : 0;

      const revenueToday = (salesToday.data ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
      const revenueWeek = (salesWeek.data ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);

      const low = (lowStock.data ?? []).filter((i) => Number(i.quantity) <= Number(i.low_stock_threshold));

      // Aggregate 30-day trend
      const byDate: Record<string, number> = {};
      (eggs30.data ?? []).forEach((r) => {
        const good = r.eggs_collected - r.cracked_eggs - r.damaged_eggs;
        byDate[r.record_date] = (byDate[r.record_date] ?? 0) + good;
      });
      const trend: { date: string; value: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
        trend.push({ date: d, value: byDate[d] ?? 0 });
      }
      const maxTrend = Math.max(1, ...trend.map((t) => t.value));

      return { population, initTotal, todayGood, layingRate, mortalityWeek, revenueToday, revenueWeek, low, recentSales: recentSales.data ?? [], trend, maxTrend };
    },
  });

  return (
    <AppShell title="Operational Dashboard">
      {/* KPI Grid — role-filtered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Current Population" value={number(data?.population)} sub={`${number(data?.initTotal)} placed`} />
        <StatCard label="Today's Eggs (good)" value={number(data?.todayGood)} sub={`${data?.layingRate ?? 0}% laying rate`} tone="good" />
        {can(role, "sell") && (
          <StatCard label="Today's Revenue" value={currency(data?.revenueToday)} sub={`${currency(data?.revenueWeek)} this week`} tone="good" />
        )}
        <StatCard label="Mortality (7 days)" value={number(data?.mortalityWeek)} sub={data?.mortalityWeek && data.mortalityWeek > 0 ? "Monitor flock health" : "All clear"} tone={data?.mortalityWeek && data.mortalityWeek > 20 ? "danger" : "default"} />
      </div>

      {/* Low stock alerts */}
      {data && data.low.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Low stock alert</p>
          <div className="flex flex-wrap gap-2">
            {data.low.map((i) => (
              <span key={i.id} className="text-xs bg-white border border-amber-200 text-amber-900 px-2.5 py-1 rounded-md font-medium">
                {i.name}: {number(Number(i.quantity))} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trend + recent sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card title="30-Day Egg Production Trend">
          <div className="h-56 flex items-end gap-1">
            {(data?.trend ?? []).map((t, i) => (
              <div key={t.date} className="flex-1 rounded-t-sm transition-all" style={{ height: `${(t.value / (data?.maxTrend ?? 1)) * 100}%`, backgroundColor: i > 20 ? "#059669" : "#d1fae5" }} title={`${t.date}: ${t.value}`} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between text-[10px] text-brand-400 uppercase font-bold tracking-widest">
            <span>{data?.trend[0] && dateShort(data.trend[0].date)}</span>
            <span>Today</span>
          </div>
        </Card>

        <Card title="Recent Sales">
          {!data?.recentSales.length ? (
            <EmptyState title="No sales yet" hint="Recorded sales will appear here" />
          ) : (
            <ul className="space-y-3">
              {data.recentSales.map((s: any) => (
                <li key={s.id} className="flex items-start justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-900 truncate">{s.customers?.name ?? "Walk-in"}</p>
                    <p className="text-[11px] text-brand-400">{dateShort(s.sale_date)} • {s.quantity} {s.unit}</p>
                  </div>
                  <span className="font-semibold text-brand-900">{currency(Number(s.total_amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
