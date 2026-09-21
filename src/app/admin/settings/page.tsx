import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/queries/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-base font-medium">Task Carryover</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When enabled, team members can carry forward unfinished tasks from previous days.
          </p>
          <SettingsForm initialEnabled={settings.taskCarryoverEnabled} />
        </CardContent>
      </Card>
    </>
  );
}
