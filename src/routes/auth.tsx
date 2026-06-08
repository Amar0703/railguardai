import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Train, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — RailGuard AI" },
      { name: "description", content: "Sign in to your RailGuard AI account." },
    ],
  }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect away if already signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = credSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = credSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      ...parsed.data,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — you're signed in");
    navigate({ to: "/dashboard" });
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col bg-background mesh-bg">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Train className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">RailGuard <span className="gradient-text">AI</span></span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Home</Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Access your railway safety dashboard.</p>

            <Tabs defaultValue="login" className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="engineer@railops.com" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-glow">
                    {loading ? "Authenticating..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" name="email" type="email" autoComplete="email" placeholder="you@railops.com" required />
                  </div>
                  <div>
                    <Label htmlFor="password2">Password</Label>
                    <Input id="password2" name="password" type="password" autoComplete="new-password" minLength={8} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-glow">
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              OR
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogle}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              Continue with Google
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-card lg:block">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="railg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M 220 800 L 290 0 L 310 0 L 380 800 Z" fill="url(#railg)" opacity="0.3" />
          <line x1="220" y1="800" x2="290" y2="0" stroke="white" strokeWidth="3" opacity="0.6" />
          <line x1="380" y1="800" x2="310" y2="0" stroke="white" strokeWidth="3" opacity="0.6" />
          {Array.from({ length: 18 }).map((_, i) => {
            const t = i / 18;
            const y = 800 - t * 800;
            const cx = 300;
            const w = 200 - t * 180;
            return (
              <rect key={i} x={cx - w / 2} y={y} width={w} height={6 - t * 4} fill="white" opacity={0.4 - t * 0.3} rx="1" />
            );
          })}
        </svg>

        <motion.div
          animate={{ x: [-100, 700] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] left-0"
        >
          <svg width="120" height="50" viewBox="0 0 120 50">
            <rect x="10" y="10" width="100" height="28" rx="4" fill="white" opacity="0.9" />
            <rect x="20" y="16" width="14" height="10" fill="var(--primary)" />
            <rect x="40" y="16" width="14" height="10" fill="var(--primary)" />
            <rect x="60" y="16" width="14" height="10" fill="var(--primary)" />
            <circle cx="25" cy="42" r="5" fill="var(--foreground)" />
            <circle cx="95" cy="42" r="5" fill="var(--foreground)" />
          </svg>
        </motion.div>

        <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-80">RailGuard AI</p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
            Keeping 67,000 KM of railway safe — every minute of every day.
          </h2>
        </div>
      </div>
    </div>
  );
}
