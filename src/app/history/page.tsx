import { requireUser } from "@/lib/auth-guard";
import { formatDateLabel, formatDateTimeLabel, startOfWeek, todayInTz } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";
import { getWeeklyTaskStats } from "@/lib/queries/stats";
import { memberLinks, NavBar } from "@/components/layout/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyStatsBar } from "@/components/shared/WeeklyStatsBar";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export default async function HistoryPage() {
  const session = await requireUser();
  const userId = Number(session.sub);
  const history = await getUserHistory(userId);

  const today = todayInTz();
  const weekStart = startOfWeek(today);
  const weeklyStats = await getWeeklyTaskStats(userId, weekStart);

  return (
    <>
      <NavBar name={session.name} links={memberLinks(session.role === "admin")} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <h1 className="text-primary text-xl font-medium">Your history</h1>

        <Card>
          <CardContent className="pt-6">
            <WeeklyStatsBar stats={weeklyStats} />
          </CardContent>
        </Card>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
        ) : (
          history.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-primary text-base font-medium">{formatDateLabel(entry.entryDate)}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <ul className="flex flex-col gap-1.5">
                  {entry.tasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{task.taskText}</span>
                        {task.createdAt ? (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTimeLabel(task.createdAt)}
                          </span>
                        ) : null}
                      </div>
                      {task.status ? <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge> : null}
                    </li>
                  ))}
                </ul>
                {entry.blocker ? (
                  <p>
                    <span className="text-muted-foreground">Blocker: </span>
                    {entry.blocker}
                  </p>
                ) : null}
                {entry.yesterdayComment ? (
                  <p>
                    <span className="text-muted-foreground">On yesterday: </span>
                    {entry.yesterdayComment}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </>
  );
}
