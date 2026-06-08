import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, ClipboardList, ScanLine,
  ArrowUpRight, ArrowDownRight, TrendingUp,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { listDefects, listInspections, listTickets, severityClass, statusClass, type Severity } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const defectsQ = useQuery({ queryKey: ["defects"], queryFn: listDefects });
  const inspectionsQ = useQuery({ queryKey: ["inspections"], queryFn: listInspections });
  const ticketsQ = useQuery({ queryKey: ["tickets"], queryFn: listTickets });

  const defects = defectsQ.data ?? [];
  const inspections = inspectionsQ.data ?? [];
  const tickets = ticketsQ.data ?? [];

  const activeDefects = defects.filter((d) => d.status !== "Resolved").length;
  const critical = defects.filter((d) => d.severity === "Critical").length;
  const openTickets = tickets.filter((t) => t.status !== "Resolved").length;

  const kpiCards = [
    { label: "Total Inspections", value: inspections.length.toLocaleString(), icon: ScanLine, tint: "from-primary/20 to-primary/5", iconColor: "text-primary" },
    { label: "Active Defects", value: activeDefects, icon: AlertTriangle, tint: "from-warning/20 to-warning/5", iconColor: "text-warning" },
    { label: "Critical Alerts", value: critical, icon: Activity, tint: "from-destructive/20 to-destructive/5", iconColor: "text-destructive" },
    { label: "Maintenance Tickets", value: openTickets, icon: ClipboardList, tint: "from-success/20 to-success/5", iconColor: "text-success" },
  ];

  // Trend by month from real data
  const monthFmt = (d: Date) => d.toLocaleString("en", { month: "short", year: "2-digit" });
  const trendMap = new Map<string, { month: string; defects: number; resolved: number }>();
  for (const d of defects) {
    const key = monthFmt(new Date(d.created_at));
    const e = trendMap.get(key) ?? { month: key, defects: 0, resolved: 0 };
    e.defects += 1;
    if (d.status === "Resolved") e.resolved += 1;
    trendMap.set(key, e);
  }
  const defectTrend = Array.from(trendMap.values()).slice(-12);

  const sevs: Severity[] = ["Critical", "High", "Medium", "Low"];
  const sevColors: Record<Severity, string> = {
    Critical: "var(--destructive)", High: "var(--warning)", Medium: "var(--primary)", Low: "var(--success)",
  };
  const severityDistribution = sevs.map((s) => ({
    name: s, value: defects.filter((d) => d.severity === s).length, color: sevColors[s],
  }));

  const inspectionCount = (() => {
    const m = new Map<string, number>();
    for (const i of inspections) {
      const k = monthFmt(new Date(i.created_at));
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).slice(-12).map(([month, count]) => ({ month, count }));
  })();

  const routeHealth = (() => {
    const byRoute = new Map<string, number>();
    for (const i of inspections) byRoute.set(i.route_name, (byRoute.get(i.route_name) ?? 0) + 1);
    const routes = Array.from(byRoute.keys());
    return routes.map((r) => {
      const inspIds = new Set(inspections.filter((i) => i.route_name === r).map((i) => i.id));
      const routeDefects = defects.filter((d) => d.inspection_id && inspIds.has(d.inspection_id));
      const crit = routeDefects.filter((d) => d.severity === "Critical").length;
      const score = Math.max(40, 100 - routeDefects.length * 3 - crit * 5);
      return { route: r, score, defects: routeDefects.length };
    });
  })();

  const recent = defects.slice(0, 8);
  const loading = defectsQ.isLoading || inspectionsQ.isLoading || ticketsQ.isLoading;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time view of your railway network safety.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          {loading ? "Loading…" : "All AI services nominal"}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`relative overflow-hidden border-border bg-gradient-to-br ${k.tint}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                    <p className="mt-2 font-display text-3xl font-bold">{k.value}</p>
                  </div>
                  <k.icon className={`h-5 w-5 ${k.iconColor}`} />
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                  <span className="text-muted-foreground">live from database</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {defects.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="font-display text-lg font-semibold">No inspections yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Upload a railway image on the Inspection page to see live data here.</p>
            <Link to="/inspection" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Go to AI Inspection →</Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Defect Trend</CardTitle>
                  <p className="text-xs text-muted-foreground">Detected vs resolved by month</p>
                </div>
                <Badge variant="outline" className="gap-1"><TrendingUp className="h-3 w-3" /> live</Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={defectTrend}>
                    <defs>
                      <linearGradient id="d1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="d2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="defects" stroke="var(--primary)" fill="url(#d1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="resolved" stroke="var(--success)" fill="url(#d2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Severity Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">Current defects</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={severityDistribution} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {severityDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Monthly Inspection Count</CardTitle>
                <p className="text-xs text-muted-foreground">Scans processed</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={inspectionCount}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Route Health</CardTitle>
                <p className="text-xs text-muted-foreground">Composite safety score</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {routeHealth.length === 0 && <p className="text-sm text-muted-foreground">No route data yet.</p>}
                {routeHealth.map((r) => (
                  <div key={r.route}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{r.route}</span>
                      <span className={r.score > 80 ? "text-success" : r.score > 65 ? "text-warning" : "text-destructive"}>{r.score}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-muted">
                      <div className={`h-full rounded-full ${r.score > 80 ? "bg-success" : r.score > 65 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <p className="text-xs text-muted-foreground">Latest defect detections</p>
              </div>
              <Link to="/map" className="text-xs font-medium text-primary hover:underline">View all →</Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Defect ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs">{d.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{d.defect_type}</TableCell>
                        <TableCell><Badge variant="outline" className={severityClass(d.severity)}>{d.severity}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(d.created_at).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline" className={statusClass(d.status)}>{d.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
