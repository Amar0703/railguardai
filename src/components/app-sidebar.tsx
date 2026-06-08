import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanLine,
  Map,
  Wrench,
  BarChart3,
  FileText,
  Settings,
  Train,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Inspection", url: "/inspection", icon: ScanLine },
  { title: "Defect Map", url: "/map", icon: Map },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow elegant-shadow">
            <Train className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-sidebar-foreground">RailGuard</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">AI Platform</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const active = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground elegant-shadow"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "drop-shadow")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 glass rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            <span className="text-xs font-medium text-sidebar-foreground">AI Engine Online</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">v3.2 · 67,142 KM monitored</p>
        </div>
      </aside>
    </>
  );
}
