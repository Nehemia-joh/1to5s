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
import { User, Mail, CheckCircle2, Clock, AlertCircle, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  not_started: { label: "Not started", variant: "outline", icon: <Circle className="h-3.5 w-3.5" /> },
  in_progress: { label: "In progress", variant: "secondary", icon: <Clock className="h-3.5 w-3.5" /> },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  abandoned: { label: "Abandoned", variant: "destructive", icon: <AlertCircle className="h-3.5 w-3.5" /> },
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
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/roster"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roster
      </Link>

      {/* User Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{person.name}</h1>
                <Badge variant={person.active ? "default" : "outline"}>
                  {person.active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant={person.role === "admin" ? "default" : "secondary"}>
                  {person.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {person.email}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base font-medium flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            This Week&apos;s Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyStatsBar stats={weeklyStats} />
        </CardContent>
      </Card>

      {/* History */}
      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No 1-5s submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submission History
          </h2>

          {history.map((entry, entryIndex) => (
            <Card key={entry.id} className={`transition-all hover:shadow-md ${entryIndex === 0 ? 'ring-2 ring-primary/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-base font-medium">
                    {formatDateLabel(entry.entryDate)}
                  </CardTitle>
                  {entryIndex === 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Latest
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tasks */}
                <div className="space-y-2">
                  {entry.tasks.map((task) => {
                    const statusConfig = task.status ? STATUS_CONFIG[task.status] : null;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            task.status === "completed"
                              ? "bg-primary/20 text-primary"
                              : task.status === "in_progress"
                              ? "bg-highlight/20 text-highlight"
                              : task.status === "abandoned"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {statusConfig?.icon ?? <Circle className="h-3.5 w-3.5" />}
                          </div>
                          <span className="text-sm truncate">{task.taskText}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.createdAt ? (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTimeLabel(task.createdAt)}
                            </span>
                          ) : null}
                          {statusConfig && (
                            <Badge variant={statusConfig.variant} className="text-xs">
                              {statusConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comments */}
                {(entry.blocker || entry.yesterdayComment) && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    {entry.blocker ? (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">Blocker: </span>
                          <span className="text-muted-foreground">{entry.blocker}</span>
                        </div>
                      </div>
                    ) : null}
                    {entry.yesterdayComment ? (
                      <div className="flex items-start gap-2 text-sm">
                        <svg className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <div>
                          <span className="font-medium text-foreground">On yesterday: </span>
                          <span className="text-muted-foreground">{entry.yesterdayComment}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
