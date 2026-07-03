import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Egg, TrendingUp, ShieldCheck, LineChart, Users, Package,
  BarChart3, ArrowRight, CheckCircle2, Bird, Wallet, ClipboardList, ShoppingCart,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-white text-brand-900">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-surface-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-accent-emerald-500 rounded-lg flex items-center justify-center">
              <Egg className="size-5 text-brand-900" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">OvaTrack Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-700">
            <a href="#features" className="hover:text-brand-900">Features</a>
            <a href="#modules" className="hover:text-brand-900">Modules</a>
            <a href="#roles" className="hover:text-brand-900">Roles</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm font-medium text-brand-700 hover:text-brand-900 px-3 py-2">Sign in</Link>
            <Link to="/auth" className="text-sm font-semibold bg-accent-emerald-600 hover:bg-accent-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-50 to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 lg:pt-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-emerald-50 border border-accent-emerald-100 text-accent-emerald-700 text-xs font-semibold mb-6">
              <span className="size-1.5 rounded-full bg-accent-emerald-500" />
              Built for commercial layer farms
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6 text-balance">
              The operating system for your <span className="text-accent-emerald-600">poultry business.</span>
            </h1>
            <p className="text-lg text-brand-600 max-w-2xl leading-relaxed mb-8">
              Replace paper notebooks and scattered spreadsheets with a single source of truth. Track every flock, egg, sale, and expense — and know your true profit at all times.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-colors">
                Open the platform <ArrowRight className="size-4" />
              </Link>
              <a href="#modules" className="inline-flex items-center gap-2 bg-white border border-surface-200 hover:bg-surface-50 text-brand-900 text-sm font-semibold px-5 py-3 rounded-lg transition-colors">
                See modules
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-brand-600">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-accent-emerald-600" />Role-based access</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-accent-emerald-600" />Bank-grade data isolation</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-accent-emerald-600" />Automatic P&L</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 rounded-2xl border border-surface-200 bg-white shadow-2xl shadow-brand-900/10 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
              <div className="hidden lg:block bg-brand-900 p-4">
                <div className="flex items-center gap-2 px-3 py-2 mb-4">
                  <div className="size-6 bg-accent-emerald-500 rounded"></div>
                  <span className="text-white text-sm font-semibold">OvaTrack Pro</span>
                </div>
                {["Dashboard","Flock Management","Egg Production","Sales & Orders","Inventory","Reports"].map((l, i) => (
                  <div key={l} className={`px-3 py-2 text-xs rounded-md mb-1 ${i===0 ? "bg-brand-800 text-white font-medium" : "text-brand-200"}`}>{l}</div>
                ))}
              </div>
              <div className="p-6 bg-surface-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Population", value: "6,842", sub: "-12 today" },
                    { label: "Today's eggs", value: "5,920", sub: "86.5% rate" },
                    { label: "Weekly sales", value: "$4,280", sub: "+8% WoW" },
                    { label: "Feed stock", value: "1,420kg", sub: "4 days left" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white rounded-lg border border-surface-200 p-4">
                      <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">{k.label}</p>
                      <p className="text-xl font-bold mt-1">{k.value}</p>
                      <p className="text-[10px] text-brand-600 mt-1">{k.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white rounded-lg border border-surface-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold">30-Day Production Trend</h4>
                    <span className="text-[10px] text-brand-400 font-semibold uppercase">Live</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[40,45,42,55,60,58,65,70,75,72,78,80,82,85,88,84,86,90,92,88,90,94,92,95,93,96,98,95,97,99].map((h,i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i > 25 ? "#059669" : "#d1fae5" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 bg-surface-50 border-y border-surface-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-emerald-600 mb-3">Why OvaTrack Pro</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for the reality of a working farm</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Know your profit daily", body: "Every sale, feed bag, and expense flows into a live P&L. No more end-of-month surprises." },
              { icon: ShieldCheck, title: "Role-based access", body: "Managers, sales officers, and workers each see exactly what they need — and nothing they don't." },
              { icon: LineChart, title: "Trends you can act on", body: "Track laying rate, mortality, and feed conversion week over week. Catch problems before they cost you." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-surface-200 p-8">
                <div className="size-10 rounded-lg bg-accent-emerald-50 flex items-center justify-center mb-5">
                  <f.icon className="size-5 text-accent-emerald-700" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-brand-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-emerald-600 mb-3">Everything in one place</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ten modules, one workflow</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Bird, title: "Flock Management", body: "Batches, breed, age, mortality, and culling." },
              { icon: Egg, title: "Egg Production", body: "Daily collection, cracked and damaged, laying rate." },
              { icon: ShoppingCart, title: "Sales & Receipts", body: "Record sales, generate printable receipts, track revenue." },
              { icon: Users, title: "Customers", body: "Directory with purchase history linked to sales." },
              { icon: ClipboardList, title: "Employees & Attendance", body: "Roster, duties, and daily attendance." },
              { icon: Package, title: "Feed & Inventory", body: "Purchases, usage, and low-stock alerts." },
              { icon: Wallet, title: "Expenses", body: "Categorized costs feeding into your P&L." },
              { icon: BarChart3, title: "Reports & Analytics", body: "Daily, weekly, and monthly reports." },
            ].map((m) => (
              <div key={m.title} className="bg-white rounded-lg border border-surface-200 p-5 hover:border-accent-emerald-500 transition-colors">
                <m.icon className="size-5 text-accent-emerald-600 mb-3" />
                <h3 className="text-sm font-bold mb-1">{m.title}</h3>
                <p className="text-xs text-brand-600 leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24 bg-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-emerald-500 mb-3">Four Roles</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Give your team the right access</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Administrator", body: "Full access. Manages users, settings, and all records." },
              { title: "Farm Manager", body: "Records production, mortality, inventory, and workers." },
              { title: "Sales Officer", body: "Records sales, manages customers, prints receipts." },
              { title: "Farm Worker", body: "Records completed tasks and views their own schedule." },
            ].map((r) => (
              <div key={r.title} className="rounded-lg border border-brand-800 p-6">
                <h3 className="text-base font-bold text-accent-emerald-500 mb-2">{r.title}</h3>
                <p className="text-sm text-brand-200 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex justify-center">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-accent-emerald-500 hover:bg-accent-emerald-600 text-brand-900 text-sm font-bold px-6 py-3 rounded-lg transition-colors">
              Create your account <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-surface-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-accent-emerald-500 rounded"></div>
            <span className="text-sm font-bold">OvaTrack Pro</span>
          </div>
          <p className="text-xs text-brand-400">© 2026 OvaTrack Pro. Enterprise poultry management.</p>
        </div>
      </footer>
    </div>
  );
}
