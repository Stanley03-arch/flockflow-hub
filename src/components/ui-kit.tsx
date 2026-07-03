import { ReactNode } from "react";

export function StatCard({
  label, value, sub, tone = "default",
}: { label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "warn" | "danger" | "good" }) {
  const toneCls = {
    default: "text-brand-600",
    warn: "text-amber-600",
    danger: "text-red-600",
    good: "text-accent-emerald-600",
  }[tone];
  return (
    <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
      <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-brand-900">{value}</h3>
      </div>
      {sub && <p className={`mt-3 text-[11px] font-medium ${toneCls}`}>{sub}</p>}
    </div>
  );
}

export function Card({ title, action, children, padding = true }: { title?: string; action?: ReactNode; children: ReactNode; padding?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
      {(title || action) && (
        <div className="p-5 flex items-center justify-between border-b border-surface-100">
          {title && <h4 className="font-bold text-brand-900">{title}</h4>}
          {action}
        </div>
      )}
      <div className={padding ? "p-5" : ""}>{children}</div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-12 text-brand-500">
      <p className="text-sm font-medium text-brand-700">{title}</p>
      {hint && <p className="text-xs mt-1 text-brand-400">{hint}</p>}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type = "button", disabled }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 bg-accent-emerald-600 hover:bg-accent-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, type = "button" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} className="inline-flex items-center gap-2 bg-white border border-surface-200 hover:bg-surface-50 text-brand-900 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald-500 bg-white";
