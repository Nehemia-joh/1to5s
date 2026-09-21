import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateLabel, formatDateTimeLabel, startOfWeek, todayInTz } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";
import { getWeeklyTaskStats } from "@/lib/queries/stats";
import { WeeklyStatsBar } from "@/components/shared/WeeklyStatsBar";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const id = Number(userId);
  if (!Number.isInteger(id)) notFound();

  const [person] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!person) notFound();

  const history = await getUserHistory(id);

  const today = todayInTz();
  const weekStart = startOfWeek(today);
  const weeklyStats = await getWeeklyTaskStats(id, weekStart);

  return (
    <>
      <div className="flex items-center gap-3">
        <h1 className="text-primary text-xl font-medium">{person.name}</h1>
        <Badge variant={person.active ? "secondary" : "outline"}>{person.active ? "Active" : "Inactive"}</Badge>
        <Badge variant={person.role === "admin" ? "default" : "outline"}>{person.role}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{person.email}</p>

      <Card>
        <CardContent className="pt-6">
          <WeeklyStatsBar stats={weeklyStats} />
        </CardContent>
      </Card>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No 1-5s submitted yet.</p>
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
    </>
  );
}
