import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateLabel, startOfWeek, todayInTz } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";
import { getWeeklyTaskStats } from "@/lib/queries/stats";
import { WeeklyStatsBar } from "@/components/shared/WeeklyStatsBar";
import { User, Mail, ArrowLeft, ClipboardList, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode; bgColor: string }> = {
  not_started: { label: "Not started", variant: "outline", icon: <Circle className="h-3 w-3" />, bgColor: "bg-muted" },
  in_progress: { label: "In progress", variant: "secondary", icon: <Clock className="h-3 w-3" />, bgColor: "bg-highlight/20" },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, bgColor: "bg-primary/20" },
  abandoned: { label: "Abandoned", variant: "destructive", icon: <AlertCircle className="h-3 w-3" />, bgColor: "bg-destructive/20" },
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
    <div className="space-y-4 sm:space-y-6">
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
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{person.name}</h1>
                <Badge variant={person.active ? "default" : "outline"} className="text-[10px] sm:text-xs">
                  {person.active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant={person.role === "admin" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                  {person.role}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{person.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-primary text-sm sm:text-base font-medium flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            This Week&apos;s Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <WeeklyStatsBar stats={weeklyStats} />
        </CardContent>
      </Card>

      {/* History */}
      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 sm:py-12">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/50">
              <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No 1-5s submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submission History
          </h2>

          <div className="flex flex-col gap-3 sm:gap-4">
            {history.map((entry, index) => (
              <Card key={entry.id} className={`transition-all hover:shadow-md ${index === 0 ? "ring-2 ring-primary/20" : ""}`}>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-sm sm:text-base font-medium">
                      {formatDateLabel(entry.entryDate)}
                    </CardTitle>
                    {index === 0 && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="space-y-2">
                    {entry.tasks.map((task) => {
                      const statusConfig = task.status ? STATUS_CONFIG[task.status] : null;
                      return (
                        <div
                          key={task.id}
                          className="rounded-lg bg-muted/30 p-2.5 sm:p-3 transition-all hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full ${statusConfig?.bgColor ?? "bg-muted"} shrink-0`}>
                                {statusConfig?.icon ?? <Circle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                              </div>
                              <span className="text-xs sm:text-sm leading-tight">{task.taskText}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1.5 ml-7 sm:ml-8">
                            {statusConfig && (
                              <Badge variant={statusConfig.variant} className="text-[10px] sm:text-xs px-1.5 py-0">
                                {statusConfig.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(entry.blocker || entry.yesterdayComment) && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                      {entry.blocker ? (
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium text-foreground">Blocker: </span>
                            <span className="text-muted-foreground">{entry.blocker}</span>
                          </div>
                        </div>
                      ) : null}
                      {entry.yesterdayComment ? (
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
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
        </>
      )}
    </div>
  );
}
