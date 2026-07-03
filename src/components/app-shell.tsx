import { ReactNode, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Egg, Bird, ShoppingCart, Users, UserSquare,
  Package, Wallet, BarChart3, Settings, Menu, X, LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRole, roleLabel, useCurrentUser, type AppRole } from "@/lib/use-role";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles?: AppRole[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/batches", label: "Flock Management", icon: Bird, roles: ["admin", "manager", "worker"] },
  { to: "/production", label: "Egg Production", icon: Egg, roles: ["admin", "manager", "worker"] },
  { to: "/sales", label: "Sales & Orders", icon: ShoppingCart, roles: ["admin", "manager", "sales"] },
  { to: "/customers", label: "Customers", icon: UserSquare, roles: ["admin", "manager", "sales"] },
  { to: "/employees", label: "Employees", icon: Users, roles: ["admin", "manager", "worker"] },
  { to: "/inventory", label: "Feed & Inventory", icon: Package, roles: ["admin", "manager", "worker"] },
  { to: "/expenses", label: "Expenses", icon: Wallet, roles: ["admin", "manager"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager", "sales"] },
  { to: "/users", label: "Users & Settings", icon: Settings, roles: ["admin"] },
];

export function AppShell({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: role } = useRole();
  const { data: user } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const items = NAV.filter((i) => !i.roles || (role && i.roles.includes(role)));
  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const SidebarInner = (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="size-9 bg-accent-emerald-500 rounded-lg flex items-center justify-center">
          <Egg className="size-5 text-brand-900" strokeWidth={2.5} />
        </div>
        <span className="font-semibold tracking-tight text-lg text-white">OvaTrack Pro</span>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? "bg-brand-800 text-white font-medium" : "text-brand-200 hover:bg-brand-800 hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-brand-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="size-9 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate">{user?.email}</span>
            <span className="text-[10px] text-brand-400">{role ? roleLabel[role] : "…"}</span>
          </div>
          <button
            onClick={signOut}
            className="text-brand-400 hover:text-white p-1 rounded"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-brand-900 text-white flex-col hidden lg:flex sticky top-0 h-screen">
        {SidebarInner}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-brand-900 text-white flex flex-col z-50 lg:hidden">
            {SidebarInner}
          </aside>
        </>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden text-brand-700 p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-brand-400 hidden sm:inline">Management</span>
              <span className="text-brand-200 hidden sm:inline">/</span>
              <span className="font-medium text-brand-900 truncate">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">{action}</div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
