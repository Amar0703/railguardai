import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiMetrics, defectTrend, defectsByType, routeHealth } from "@/lib/mock-data";
import { Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: Analytics,
});

const aiRadar = [
  { metric: "Precision", value: 94.6 },
  { metric: "Recall", value: 92.1 },
  { metric: "F1", value: 93.3 },
  { metric: "Accuracy", value: 95.2 },
  { metric: "Speed", value: 88 },
];

function Analytics() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">AI model performance and defect insights.</p>
      </header>

      {/* AI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Precision", v: aiMetrics.precision, g: "from-primary/20" },
          { l: "Recall", v: aiMetrics.recall, g: "from-success/20" },
          { l: "F1 Score", v: aiMetrics.f1, g: "from-warning/20" },
          { l: "Accuracy", v: aiMetrics.accuracy, g: "from-chart-5/20" },
        ].map((m) => (
          <Card key={m.l} className={`bg-gradient-to-br ${m.g} to-transparent`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">{m.l}</p>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{m.v}%</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${m.v}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Defects by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defectsByType} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="type" stroke="var(--muted-foreground)" fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">AI Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={aiRadar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={defectTrend}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="defects" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Inspection Coverage</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-2">
            {routeHealth.map((r) => (
              <div key={r.route}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{r.route}</span>
                  <span className="font-mono text-muted-foreground">{r.score}% · {r.defects} defects</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${r.score > 80 ? "bg-success" : r.score > 65 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Severity Heatmap */}
      <Card>
        <CardHeader><CardTitle className="text-base">Severity Heatmap · Route × Month</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[160px_repeat(12,1fr)] gap-1 min-w-[700px]">
              <div></div>
              {defectTrend.map((d) => <div key={d.month} className="text-center text-[10px] font-mono text-muted-foreground">{d.month}</div>)}
              {routeHealth.map((r) => (
                <div key={r.route} className="contents">
                  <div className="truncate text-xs font-medium pr-2 self-center">{r.route}</div>
                  {defectTrend.map((d, j) => {
                    const intensity = ((r.defects * (j + 1)) % 11) / 10;
                    return (
                      <div
                        key={d.month}
                        className="aspect-square rounded"
                        style={{ background: `color-mix(in oklab, var(--destructive) ${intensity * 90}%, var(--muted))` }}
                        title={`${r.route} · ${d.month}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
