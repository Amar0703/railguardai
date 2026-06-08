import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, AI thresholds, and integrations.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label>Full name</Label><Input defaultValue="Anita Sharma" /></div>
          <div><Label>Email</Label><Input type="email" placeholder="you@railops.com" /></div>
          <div><Label>Role</Label>
            <Select defaultValue="engineer">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Region</Label>
            <Select defaultValue="northern">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="northern">Northern Region</SelectItem>
                <SelectItem value="eastern">Eastern Region</SelectItem>
                <SelectItem value="western">Western Region</SelectItem>
                <SelectItem value="southern">Southern Region</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">AI Detection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { l: "Auto-create maintenance tickets for Critical defects", d: true },
            { l: "Send emergency SMS to on-call crew", d: true },
            { l: "Include low-confidence detections (<70%)", d: false },
            { l: "Enable beta: predictive failure model", d: false },
          ].map((s) => (
            <div key={s.l} className="flex items-center justify-between">
              <p className="text-sm">{s.l}</p>
              <Switch defaultChecked={s.d} />
            </div>
          ))}
          <div className="pt-2"><Label>Min confidence threshold</Label><Input defaultValue="75" type="number" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Email digest", "Push alerts", "SMS (critical only)", "Slack integration"].map((l) => (
            <div key={l} className="flex items-center justify-between">
              <p className="text-sm">{l}</p>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved")} className="bg-gradient-to-r from-primary to-primary-glow">Save changes</Button>
      </div>
    </div>
  );
}
