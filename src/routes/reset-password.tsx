import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { /* Supabase auto-parses recovery hash */ }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    nav({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl border border-surface-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-brand-900 mb-1">Set a new password</h1>
        <p className="text-sm text-brand-600 mb-6">Choose a strong password (6+ characters).</p>
        <form onSubmit={submit} className="space-y-4">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald-500" placeholder="New password" />
          <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-accent-emerald-600 hover:bg-accent-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50">
            {loading && <Loader2 className="size-4 animate-spin" />}Update password
          </button>
        </form>
      </div>
    </div>
  );
}
