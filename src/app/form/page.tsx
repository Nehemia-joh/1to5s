import { requireUser } from "@/lib/auth-guard";
import { classifyDate, formatDateLabel, previousWorkingDay, todayInTz } from "@/lib/dates";
import { getEntryWithTasks } from "@/lib/queries/entries";
import { memberLinks, NavBar } from "@/components/layout/NavBar";
import { DailyEntryForm } from "@/components/forms/DailyEntryForm";
import { PreviousTasksPanel } from "@/components/forms/PreviousTasksPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FormPage({ searchParams }: { searchParams: Promise<{ asOf?: string }> }) {
  const session = await requireUser();
  const userId = Number(session.sub);

  const { asOf } = await searchParams;
  const today = todayInTz(asOf);
  const dayType = await classifyDate(today);

  const existing = await getEntryWithTasks(userId, today);

  const prevDay = await previousWorkingDay(today);
  const prevEntry = prevDay ? await getEntryWithTasks(userId, prevDay) : null;

  return (
    <>
      <NavBar name={session.name} links={memberLinks(session.role === "admin")} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <h1 className="text-primary text-xl font-medium">{formatDateLabel(today)}</h1>

        {prevEntry && prevEntry.tasks.length > 0 ? (
          <PreviousTasksPanel dateLabel={formatDateLabel(prevDay!)} tasks={prevEntry.tasks} />
        ) : null}

        {dayType === "holiday" || dayType === "weekend" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-base font-medium">No 1-5 today</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {dayType === "holiday" ? "It's a public holiday." : "It's the weekend."} Enjoy the break.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-base font-medium">Today&apos;s 1-5</CardTitle>
            </CardHeader>
            <CardContent>
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
