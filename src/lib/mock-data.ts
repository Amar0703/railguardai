export type Severity = "Critical" | "High" | "Medium" | "Low";
export type DefectType =
  | "Rail Crack"
  | "Rail Fracture"
  | "Missing Bolt"
  | "Loose Fastener"
  | "Vegetation"
  | "Track Misalignment";

export interface Defect {
  id: string;
  type: DefectType;
  severity: Severity;
  location: string;
  route: string;
  lat: number;
  lng: number;
  // normalized 0-100 for SVG map
  x: number;
  y: number;
  confidence: number;
  detectedAt: string;
  status: "Pending" | "In Progress" | "Resolved";
  recommendation: string;
}

export interface Ticket {
  id: string;
  defectId: string;
  location: string;
  type: DefectType;
  priority: Severity;
  team: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
}

const teams = ["Alpha Crew", "Bravo Crew", "Delta Crew", "Echo Crew"];
const routes = ["Northern Corridor", "Eastern Line", "Western Express", "Southern Belt", "Central Junction"];
const recs: Record<DefectType, string> = {
  "Rail Crack": "Immediate ultrasonic inspection. Replace rail section within 48h.",
  "Rail Fracture": "Halt traffic. Emergency rail replacement required.",
  "Missing Bolt": "Replace fasteners. Torque-check adjacent bolts.",
  "Loose Fastener": "Re-torque to spec. Schedule re-inspection in 7 days.",
  "Vegetation": "Dispatch vegetation control. Apply growth inhibitor.",
  "Track Misalignment": "Survey alignment. Schedule tamping operation.",
};

const types: DefectType[] = [
  "Rail Crack", "Rail Fracture", "Missing Bolt", "Loose Fastener", "Vegetation", "Track Misalignment",
];
const sevs: Severity[] = ["Critical", "High", "Medium", "Low"];
const statuses: Array<Defect["status"]> = ["Pending", "In Progress", "Resolved"];

function seeded(n: number) {
  let s = n * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const defects: Defect[] = Array.from({ length: 32 }, (_, i) => {
  const r = seeded(i + 1);
  const type = types[Math.floor(r() * types.length)];
  const severity = sevs[Math.floor(r() * sevs.length)];
  const route = routes[Math.floor(r() * routes.length)];
  const km = (r() * 1200).toFixed(1);
  return {
    id: `DEF-${(2401 + i).toString()}`,
    type,
    severity,
    location: `${route} KM ${km}`,
    route,
    lat: 22 + r() * 8,
    lng: 75 + r() * 12,
    x: 8 + r() * 84,
    y: 8 + r() * 84,
    confidence: Math.round(75 + r() * 24),
    detectedAt: new Date(Date.now() - r() * 1000 * 60 * 60 * 24 * 30).toISOString(),
    status: statuses[Math.floor(r() * statuses.length)],
    recommendation: recs[type],
  };
});

export const tickets: Ticket[] = defects.slice(0, 18).map((d, i) => ({
  id: `TKT-${(1001 + i).toString()}`,
  defectId: d.id,
  location: d.location,
  type: d.type,
  priority: d.severity,
  team: teams[i % teams.length],
  status: d.status,
  createdAt: d.detectedAt,
}));

export const kpis = {
  totalInspections: 14823,
  activeDefects: defects.filter((d) => d.status !== "Resolved").length,
  criticalAlerts: defects.filter((d) => d.severity === "Critical").length,
  maintenanceTickets: tickets.filter((t) => t.status !== "Resolved").length,
};

export const defectTrend = [
  { month: "Jan", defects: 142, resolved: 128 },
  { month: "Feb", defects: 168, resolved: 151 },
  { month: "Mar", defects: 195, resolved: 174 },
  { month: "Apr", defects: 178, resolved: 169 },
  { month: "May", defects: 220, resolved: 198 },
  { month: "Jun", defects: 248, resolved: 230 },
  { month: "Jul", defects: 232, resolved: 215 },
  { month: "Aug", defects: 268, resolved: 240 },
  { month: "Sep", defects: 291, resolved: 261 },
  { month: "Oct", defects: 312, resolved: 285 },
  { month: "Nov", defects: 295, resolved: 280 },
  { month: "Dec", defects: 330, resolved: 305 },
];

export const severityDistribution = [
  { name: "Critical", value: defects.filter((d) => d.severity === "Critical").length, color: "var(--destructive)" },
  { name: "High", value: defects.filter((d) => d.severity === "High").length, color: "var(--warning)" },
  { name: "Medium", value: defects.filter((d) => d.severity === "Medium").length, color: "var(--primary)" },
  { name: "Low", value: defects.filter((d) => d.severity === "Low").length, color: "var(--success)" },
];

export const inspectionCount = [
  { month: "Jan", count: 980 },
  { month: "Feb", count: 1120 },
  { month: "Mar", count: 1340 },
  { month: "Apr", count: 1190 },
  { month: "May", count: 1410 },
  { month: "Jun", count: 1605 },
  { month: "Jul", count: 1520 },
  { month: "Aug", count: 1748 },
  { month: "Sep", count: 1822 },
  { month: "Oct", count: 1980 },
  { month: "Nov", count: 1865 },
  { month: "Dec", count: 2103 },
];

export const defectsByType = types.map((t) => ({
  type: t,
  count: defects.filter((d) => d.type === t).length,
}));

export const aiMetrics = {
  precision: 94.6,
  recall: 92.1,
  f1: 93.3,
  accuracy: 95.2,
};

export const routeHealth = routes.map((r) => {
  const routeDefects = defects.filter((d) => d.route === r);
  const critical = routeDefects.filter((d) => d.severity === "Critical").length;
  const score = Math.max(40, 100 - routeDefects.length * 3 - critical * 5);
  return { route: r, score, defects: routeDefects.length };
});

export function severityColor(s: Severity) {
  switch (s) {
    case "Critical": return "var(--destructive)";
    case "High": return "var(--warning)";
    case "Medium": return "var(--primary)";
    case "Low": return "var(--success)";
  }
}

export function severityClass(s: Severity) {
  switch (s) {
    case "Critical": return "bg-destructive/15 text-destructive border-destructive/30";
    case "High": return "bg-warning/15 text-warning border-warning/30";
    case "Medium": return "bg-primary/15 text-primary border-primary/30";
    case "Low": return "bg-success/15 text-success border-success/30";
  }
}

export function statusClass(s: Defect["status"]) {
  switch (s) {
    case "Pending": return "bg-warning/15 text-warning border-warning/30";
    case "In Progress": return "bg-primary/15 text-primary border-primary/30";
    case "Resolved": return "bg-success/15 text-success border-success/30";
  }
}
