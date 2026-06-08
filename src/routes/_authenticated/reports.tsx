import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { defects, kpis, routeHealth } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
});

const reports = [
  { title: "Inspection Summary", desc: "Comprehensive overview of all inspections in the period.", count: kpis.totalInspections },
  { title: "Defect Statistics", desc: "Breakdown by type, severity, and resolution status.", count: defects.length },
  { title: "Route Analysis", desc: "Per-route health scores and defect density.", count: routeHealth.length },
  { title: "Maintenance History", desc: "Resolved tickets, mean time to resolution, crew efficiency.", count: 482 },
];

function Reports() {
  function download(name: string, format: "PDF" | "CSV") {
    toast.success(`${name}.${format.toLowerCase()} generated`);
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate audit-ready reports for any time period.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> {r.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div>
                <p className="font-display text-3xl font-bold">{r.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">records</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => download(r.title, "PDF")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => download(r.title, "CSV")}>
                  <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Scheduled Reports</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Weekly Safety Briefing", when: "Every Monday 06:00 IST", to: "ops-leads@railops.com" },
            { name: "Monthly Defect Roll-up", when: "1st of each month", to: "executive@railops.com" },
            { name: "Quarterly AI Audit", when: "Quarter end", to: "compliance@railops.com" },
          ].map((s) => (
            <div key={s.name} className="glass flex items-center justify-between rounded-lg p-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.when} → {s.to}</p>
              </div>
              <Button size="sm" variant="ghost">Configure</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
