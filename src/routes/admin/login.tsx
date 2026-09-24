import { useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Portal Sign In — FABRICO Style Studio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast.success("Welcome to FABRICO Operations Portal.");
      router.navigate({ to: "/admin" as any });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Invalid authentication credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    toast.success("Entering studio admin workspace.");
    router.navigate({ to: "/admin" as any });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-card border border-border p-8 sm:p-10 shadow-xl space-y-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="font-serif text-3xl tracking-[0.25em] font-medium block">
            FABRICO
          </Link>
          <p className="eyebrow text-gold text-[0.62rem] tracking-[0.2em]">
            Studio Operations & CMS
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="eyebrow text-[0.62rem] text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fabrico.pk"
                className="w-full bg-muted/40 border border-border pl-10 pr-3 py-2.5 outline-none focus:border-foreground transition-colors font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="eyebrow text-[0.62rem] text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-muted/40 border border-border pl-10 pr-3 py-2.5 outline-none focus:border-foreground transition-colors font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-lux w-full mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In To Workspace</span>}
          </button>
        </form>

        {/* Quick Dev Access */}
        <div className="pt-4 border-t border-border/80 space-y-3 text-center">
          <p className="text-[0.68rem] text-muted-foreground">
            Development Session Active
          </p>
          <button
            type="button"
            onClick={handleDevBypass}
            className="btn-outline w-full text-xs flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>Enter Studio Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
