import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Egg, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — OvaTrack Pro" },
      { name: "description", content: "Sign in or create your OvaTrack Pro account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message);
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-50">
      {/* Left: branding */}
      <div className="hidden lg:flex bg-brand-900 text-white p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-8 bg-accent-emerald-500 rounded-lg flex items-center justify-center">
            <Egg className="size-5 text-brand-900" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg">OvaTrack Pro</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-4">Run your farm like a real business.</h2>
          <p className="text-brand-200 leading-relaxed max-w-md">
            One trusted platform for flocks, eggs, sales, inventory, and financial reporting. Built for commercial layer operations.
          </p>
        </div>
        <p className="text-xs text-brand-400">© 2026 OvaTrack Pro</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="size-8 bg-accent-emerald-500 rounded-lg flex items-center justify-center">
              <Egg className="size-5 text-brand-900" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-brand-900">OvaTrack Pro</span>
          </Link>

          <h1 className="text-2xl font-bold text-brand-900 mb-1">
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
          </h1>
          <p className="text-sm text-brand-600 mb-8">
            {mode === "signin" ? "Welcome back to OvaTrack Pro." : mode === "signup" ? "The first account becomes Administrator." : "We'll email you a reset link."}
          </p>

          {mode !== "forgot" && (
            <>
              <button
                onClick={google}
                disabled={loading}
                className="w-full mb-4 flex items-center justify-center gap-3 bg-white border border-surface-200 hover:bg-surface-50 text-brand-900 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-surface-50 px-2 text-brand-400">or</span></div>
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-brand-700 mb-1.5">Full name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald-500 bg-white" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-brand-700 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald-500 bg-white" />
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="block text-xs font-semibold text-brand-700 mb-1.5">Password</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald-500 bg-white" />
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-accent-emerald-600 hover:bg-accent-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset email"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs">
            {mode === "signin" ? (
              <>
                <button onClick={() => setMode("forgot")} className="text-brand-600 hover:text-brand-900">Forgot password?</button>
                <button onClick={() => setMode("signup")} className="text-accent-emerald-700 font-semibold hover:underline">Create account</button>
              </>
            ) : (
              <button onClick={() => setMode("signin")} className="text-accent-emerald-700 font-semibold hover:underline">Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
