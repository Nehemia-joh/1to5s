import { requireUser } from "@/lib/auth-guard";
import { classifyDate, formatDateLabel, previousWorkingDay, todayInTz } from "@/lib/dates";
import { getEntryWithTasks } from "@/lib/queries/entries";
import { getSettings } from "@/lib/queries/settings";
import { memberLinks, NavBar } from "@/components/layout/NavBar";
import { DailyEntryForm } from "@/components/forms/DailyEntryForm";
import { PreviousTasksPanel } from "@/components/forms/PreviousTasksPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Coffee, Sun } from "lucide-react";

export default async function FormPage({ searchParams }: { searchParams: Promise<{ asOf?: string }> }) {
  const session = await requireUser();
  const userId = Number(session.sub);

  const { asOf } = await searchParams;
  const today = todayInTz(asOf);
  const dayType = await classifyDate(today);

  const existing = await getEntryWithTasks(userId, today);

  const prevDay = await previousWorkingDay(today);
  const prevEntry = prevDay ? await getEntryWithTasks(userId, prevDay) : null;

  const settings = await getSettings();

  return (
    <>
      <NavBar name={session.name} links={memberLinks(session.role === "admin")} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{formatDateLabel(today)}</h1>
            <p className="text-sm text-muted-foreground">What are you working on today?</p>
          </div>
        </div>

        {prevEntry && prevEntry.tasks.length > 0 ? (
          <PreviousTasksPanel
            dateLabel={formatDateLabel(prevDay!)}
            tasks={prevEntry.tasks}
            carryoverEnabled={settings.taskCarryoverEnabled}
          />
        ) : null}

        {dayType === "holiday" || dayType === "weekend" ? (
          <Card className="border-brand-accent/30 bg-gradient-to-br from-brand-accent/10 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/20">
                  {dayType === "holiday" ? (
                    <Sun className="h-5 w-5 text-brand-accent" />
                  ) : (
                    <Coffee className="h-5 w-5 text-brand-accent" />
                  )}
                </div>
                <CardTitle className="text-primary text-base font-medium">No 1-5 today</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {dayType === "holiday" ? "🎉 It's a public holiday." : "☕ It's the weekend."} Enjoy the break!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-primary text-lg">✏️</span>
                </div>
                <div>
                  <CardTitle className="text-primary text-base font-medium">Today&apos;s 1-5</CardTitle>
                  <p className="text-xs text-muted-foreground">Add your tasks for today</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <DailyEntryForm
                today={today}
                existingTasks={existing?.tasks ?? []}
                blocker={existing?.blocker ?? ""}
                yesterdayComment={existing?.yesterdayComment ?? ""}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
