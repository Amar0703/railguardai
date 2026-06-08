import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Image as ImageIcon, Sparkles, Activity, Loader2,
  CheckCircle2, RotateCcw, MapPin, Clock,
} from "lucide-react";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { uploadInspection, severityClass, type DefectRow, type InspectionRow } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/inspection")({
  component: Inspection,
});

function Inspection() {
  const qc = useQueryClient();
  const [stage, setStage] = useState<"idle" | "scanning" | "done">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [defects, setDefects] = useState<DefectRow[]>([]);
  const [inspection, setInspection] = useState<InspectionRow | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setStage("scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => (p >= 90 ? p : p + 5));
    }, 100);
    try {
      const result = await uploadInspection(file);
      clearInterval(interval);
      setScanProgress(100);
      setDefects(result.defects);
      setInspection(result.inspection);
      setStage("done");
      toast.success(`Scan complete · ${result.defects.length} defect${result.defects.length === 1 ? "" : "s"} detected`);
      qc.invalidateQueries({ queryKey: ["defects"] });
      qc.invalidateQueries({ queryKey: ["inspections"] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e.message ?? "Upload failed");
      reset();
    }
  }

  function reset() {
    setPreviewUrl(null);
    setStage("idle");
    setScanProgress(0);
    setDefects([]);
    setInspection(null);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">AI Inspection</h1>
        <p className="text-sm text-muted-foreground">Upload drone or trackside imagery for instant defect detection.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Detection Canvas
            </CardTitle>
            {stage !== "idle" && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {stage === "idle" ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
                onClick={() => fileRef.current?.click()}
                className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition hover:border-primary/50 hover:bg-muted/50"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 font-semibold">Drop railway image here</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 20MB · stored to your private bucket</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  <ImageIcon className="mr-1 h-3.5 w-3.5" /> Browse files
                </Button>
              </div>
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
                {previewUrl && <img src={previewUrl} alt="inspection" className="h-full w-full object-cover" />}

                {stage === "scanning" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10" />
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-primary to-transparent shadow-[0_0_30px_var(--primary)]"
                    />
                    <div className="absolute left-3 top-3 rounded-md bg-background/80 px-2.5 py-1.5 text-xs font-mono backdrop-blur">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        ANALYZING · {scanProgress}%
                      </div>
                    </div>
                  </>
                )}

                {stage === "done" && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-success/90 px-2.5 py-1.5 text-xs font-mono text-success-foreground">
                    <CheckCircle2 className="h-3 w-3" /> {defects.length} DEFECT{defects.length === 1 ? "" : "S"}
                  </div>
                )}
              </div>
            )}

            {stage === "scanning" && (
              <div className="mt-4">
                <Progress value={scanProgress} />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Uploading to secure storage & running detection…</span>
                  <span className="font-mono">{scanProgress}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Defect Details
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {stage === "done" ? "Saved to database · ticket created per defect" : "Upload an image to see results"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {stage === "done" && defects.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{d.defect_type}</p>
                      <Badge variant="outline" className={`mt-1 ${severityClass(d.severity)}`}>{d.severity}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-bold text-primary">{d.confidence}%</p>
                      <p className="text-[10px] uppercase text-muted-foreground">confidence</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {inspection?.route_name} · {d.latitude.toFixed(3)}, {d.longitude.toFixed(3)}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(d.created_at).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {stage !== "done" && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                {stage === "scanning" ? "Detecting defects..." : "No defects yet. Upload an image to begin."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
