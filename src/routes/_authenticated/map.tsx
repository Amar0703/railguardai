import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listDefects, severityClass, severityColor, type DefectRow } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/map")({
  component: DefectMap,
});

const SEVS = ["All", "Critical", "High", "Medium", "Low"];

// Project lat/lng (rough India bounding box 8–37 lat, 68–97 lng) into 0-100 %
function project(lat: number, lng: number) {
  const x = ((lng - 68) / (97 - 68)) * 100;
  const y = ((37 - lat) / (37 - 8)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

function DefectMap() {
  const { data, isLoading } = useQuery({ queryKey: ["defects"], queryFn: listDefects });
  const defects = data ?? [];
  const [sev, setSev] = useState("All");
  const [route, setRoute] = useState("All Routes");
  const [selected, setSelected] = useState<DefectRow | null>(null);

  const filtered = defects.filter((d) => sev === "All" || d.severity === sev);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Defect Map</h1>
          <p className="text-sm text-muted-foreground">Geospatial view of every detected defect.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={route} onValueChange={setRoute}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Routes">All Routes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sev} onValueChange={setSev}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEVS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-card to-muted">
              <div className="absolute inset-0 grid-pattern opacity-40" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 62" preserveAspectRatio="none">
                <path d="M 5 30 Q 30 10, 55 25 T 95 20" stroke="var(--primary)" strokeWidth="0.4" fill="none" opacity="0.6" strokeDasharray="0.6 0.6" />
                <path d="M 5 50 Q 35 55, 60 45 T 95 50" stroke="var(--primary)" strokeWidth="0.4" fill="none" opacity="0.6" strokeDasharray="0.6 0.6" />
                <path d="M 50 5 Q 45 30, 60 45 T 75 60" stroke="var(--primary)" strokeWidth="0.4" fill="none" opacity="0.6" strokeDasharray="0.6 0.6" />
              </svg>

              {filtered.map((d) => {
                const p = project(d.latitude, d.longitude);
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelected(d)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <span className="absolute inset-0 -m-1 rounded-full animate-pulse-ring" style={{ background: severityColor(d.severity), opacity: 0.4 }} />
                    <span className="relative block h-3 w-3 rounded-full ring-2 ring-background transition group-hover:scale-150" style={{ background: severityColor(d.severity), boxShadow: `0 0 12px ${severityColor(d.severity)}` }} />
                  </button>
                );
              })}

              <div className="absolute bottom-3 left-3 glass-strong rounded-lg p-3 text-xs">
                <p className="mb-2 font-semibold">Severity</p>
                <div className="space-y-1">
                  {[
                    { l: "Critical", c: "var(--destructive)" },
                    { l: "High", c: "var(--warning)" },
                    { l: "Medium", c: "var(--primary)" },
                    { l: "Low", c: "var(--success)" },
                  ].map((s) => (
                    <div key={s.l} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.c }} />
                      <span className="text-muted-foreground">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute right-3 top-3 glass-strong rounded-lg px-4 py-2 text-xs font-mono">
                <span className="text-muted-foreground">DEFECTS · </span>
                <span className="font-bold text-foreground">{filtered.length}</span>
              </div>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Loading defects…</div>
              )}
              {!isLoading && defects.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground">
                  No defects yet. Run an AI inspection to populate the map.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-destructive" /> Live Alert Feed</CardTitle>
            <p className="text-xs text-muted-foreground">Real-time defect stream</p>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
            {filtered.slice(0, 12).map((d, i) => (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(d)}
                className="w-full glass rounded-lg p-3 text-left transition hover:elegant-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.defect_type}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.latitude.toFixed(3)}, {d.longitude.toFixed(3)}</p>
                  </div>
                  <Badge variant="outline" className={severityClass(d.severity)}>{d.severity}</Badge>
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{d.id.slice(0, 8)} · conf {d.confidence}%</p>
              </motion.button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{selected.id.slice(0, 8)}</span>
                  <Badge variant="outline" className={severityClass(selected.severity)}>{selected.severity}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selected.image_url ? (
                  <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                    <img src={selected.image_url} alt="defect" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div>
                  <h3 className="font-display text-lg font-semibold">{selected.defect_type}</h3>
                  <p className="text-sm text-muted-foreground">{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="glass rounded-md p-2.5">
                    <p className="text-muted-foreground">GPS</p>
                    <p className="font-mono font-semibold">{selected.latitude.toFixed(3)}, {selected.longitude.toFixed(3)}</p>
                  </div>
                  <div className="glass rounded-md p-2.5">
                    <p className="text-muted-foreground">Confidence</p>
                    <p className="font-mono font-semibold text-primary">{selected.confidence}%</p>
                  </div>
                  <div className="glass rounded-md p-2.5">
                    <p className="text-muted-foreground">Detected</p>
                    <p className="font-mono font-semibold">{new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-3 text-xs">
                  <p className="font-semibold">Status</p>
                  <p className="mt-1 text-muted-foreground">{selected.status}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
