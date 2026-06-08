import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Train,
  ShieldCheck,
  Activity,
  Radar,
  Zap,
  Eye,
  CheckCircle2,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RailGuard AI — AI-Powered Railway Safety Monitoring" },
      { name: "description", content: "Detect rail cracks, fractures, missing bolts, and track defects with AI computer vision. Trusted by railway engineers." },
      { property: "og:title", content: "RailGuard AI" },
      { property: "og:description", content: "AI-powered railway track defect detection." },
    ],
  }),
  component: Landing,
});

const stats = [
  { label: "KM Monitored", value: "67,000+", icon: MapPin },
  { label: "Detection Accuracy", value: "95.2%", icon: Radar },
  { label: "AI Monitoring", value: "24/7", icon: Activity },
  { label: "Real-Time Alerts", value: "<2s", icon: Zap },
];

const features = [
  { icon: Eye, title: "Computer Vision AI", desc: "Detect cracks, fractures, missing bolts, vegetation and misalignment from drone or trackside imagery." },
  { icon: ShieldCheck, title: "Severity Scoring", desc: "Every defect graded Critical → Low with maintenance recommendations and ETA." },
  { icon: MapPin, title: "GPS Defect Map", desc: "Live map of every defect across your network. Filter by route, severity and status." },
  { icon: AlertTriangle, title: "Emergency Alerts", desc: "Instant escalation for critical defects with auto-dispatched maintenance tickets." },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow elegant-shadow">
              <Train className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">RailGuard <span className="gradient-text">AI</span></span>
          </Link>
          <nav className="ml-10 hidden gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#stats" className="hover:text-foreground">Network</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden mesh-bg">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
              </span>
              Live · 14,823 inspections this month
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              AI-Powered <br />
              <span className="gradient-text">Railway Safety</span> <br />
              Monitoring
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Detect track defects before they become disasters. Computer-vision models inspect drone and trackside footage to find cracks, fractures, missing bolts and more — in seconds.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 elegant-shadow">
                <Link to="/inspection">
                  Start Inspection <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> ISO 27001</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Used by 12 national operators</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> SOC 2 Type II</div>
            </div>
          </motion.div>

          {/* HERO ILLUSTRATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="border-y border-border bg-card/30 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:gap-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Built for railway engineers</h2>
          <p className="mt-3 text-muted-foreground">Everything you need to keep your network safe, online and auditable.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:elegant-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/20 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">From drone footage to dispatched crew</h2>
            <p className="mt-3 text-muted-foreground">Three steps, fully automated.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Upload imagery", desc: "Drone, trolley or trackside cameras stream to RailGuard in real time." },
              { step: "02", title: "AI detects defects", desc: "CV models flag cracks, bolts, vegetation with bounding boxes and confidence scores." },
              { step: "03", title: "Auto-dispatch", desc: "Critical defects raise tickets and notify the nearest crew with GPS coordinates." },
            ].map((s) => (
              <div key={s.step} className="glass rounded-2xl p-6">
                <span className="font-mono text-xs text-primary">STEP {s.step}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/90 via-primary to-primary-glow p-10 text-center text-primary-foreground elegant-shadow lg:p-16">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Inspect your network in minutes.</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Try the live demo with sample drone imagery — no signup required.
          </p>
          <div className="relative mt-6 flex justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/inspection">Start Inspection</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Train className="h-4 w-4 text-primary" />
            <span>© 2026 RailGuard AI · All systems operational</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border glass-strong elegant-shadow">
      {/* sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-background to-card" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* drone */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[14%] -translate-x-1/2"
      >
        <svg width="80" height="40" viewBox="0 0 80 40">
          <circle cx="14" cy="14" r="10" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
          <circle cx="66" cy="14" r="10" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
          <rect x="28" y="10" width="24" height="10" rx="3" fill="var(--primary)" />
          <line x1="14" y1="14" x2="28" y2="15" stroke="var(--foreground)" strokeWidth="1.5" />
          <line x1="66" y1="14" x2="52" y2="15" stroke="var(--foreground)" strokeWidth="1.5" />
        </svg>
      </motion.div>

      {/* scan cone */}
      <svg className="absolute left-1/2 top-[24%] -translate-x-1/2" width="220" height="220" viewBox="0 0 220 220">
        <defs>
          <linearGradient id="cone" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="110,0 0,220 220,220" fill="url(#cone)" />
      </svg>

      {/* tracks */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 160" preserveAspectRatio="none">
        {/* ground */}
        <rect x="0" y="60" width="400" height="100" fill="var(--muted)" opacity="0.5" />
        {/* sleepers */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={i * 30 + 5} y="85" width="22" height="8" fill="var(--foreground)" opacity="0.25" rx="1" />
        ))}
        {/* rails */}
        <line x1="0" y1="82" x2="400" y2="82" stroke="var(--foreground)" strokeWidth="3" opacity="0.7" />
        <line x1="0" y1="96" x2="400" y2="96" stroke="var(--foreground)" strokeWidth="3" opacity="0.7" />
      </svg>

      {/* bounding boxes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-[26%] left-[18%] h-12 w-20 rounded border-2 border-destructive"
      >
        <span className="absolute -top-5 left-0 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">CRACK 96%</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-[18%] right-[22%] h-10 w-14 rounded border-2 border-warning"
      >
        <span className="absolute -top-5 left-0 rounded bg-warning px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">BOLT 91%</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-[36%] left-[55%] h-9 w-16 rounded border-2 border-success"
      >
        <span className="absolute -top-5 left-0 rounded bg-success px-1.5 py-0.5 text-[10px] font-semibold text-success-foreground">VEG 88%</span>
      </motion.div>

      {/* scan line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-primary to-transparent opacity-80 animate-scan-line" />

      {/* HUD */}
      <div className="absolute left-3 top-3 rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-[10px] font-mono backdrop-blur">
        <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> SCANNING · KM 847.2</div>
        <div className="text-muted-foreground">GPS 28.61° N, 77.21° E</div>
      </div>
      <div className="absolute right-3 top-3 rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-[10px] font-mono backdrop-blur">
        AI CONF · <span className="text-success">94.6%</span>
      </div>
    </div>
  );
}
