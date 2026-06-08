import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listTickets, updateTicketStatus, severityClass, statusClass, type DefectStatus } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/maintenance")({
  component: Maintenance,
});

function Maintenance() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tickets"], queryFn: listTickets });
  const tickets = data ?? [];
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  async function update(id: string, status: DefectStatus) {
    try {
      await updateTicketStatus(id, status);
      await qc.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket → ${status}`);
    } catch (e: any) {
      toast.error(e.message ?? "Update failed");
    }
  }

  const counts = {
    pending: tickets.filter((t) => t.status === "Pending").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Maintenance Center</h1>
          <p className="text-sm text-muted-foreground">Tickets auto-created from AI-detected defects.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pending", value: counts.pending, cls: "from-warning/15 to-warning/5" },
          { label: "In Progress", value: counts.inProgress, cls: "from-primary/15 to-primary/5" },
          { label: "Resolved", value: counts.resolved, cls: "from-success/15 to-success/5" },
        ].map((s) => (
          <Card key={s.label} className={`bg-gradient-to-br ${s.cls}`}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Tickets</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No tickets yet. Run an AI inspection to generate one.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Defect</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{t.defect_id?.slice(0, 8) ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={severityClass(t.priority)}>{t.priority}</Badge></TableCell>
                      <TableCell>{t.assigned_team}</TableCell>
                      <TableCell>
                        <Select value={t.status} onValueChange={(v: DefectStatus) => update(t.id, v)}>
                          <SelectTrigger className={`h-7 w-32 border ${statusClass(t.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
