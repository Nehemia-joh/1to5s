import { requireUser } from "@/lib/auth-guard";
import { formatDateLabel, startOfWeek, todayInTz } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";
import { getWeeklyTaskStats } from "@/lib/queries/stats";
import { memberLinks, NavBar } from "@/components/layout/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyStatsBar } from "@/components/shared/WeeklyStatsBar";
import { Timer, ClipboardList, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode; bgColor: string }> = {
  not_started: { label: "Not started", variant: "outline", icon: <Circle className="h-3 w-3" />, bgColor: "bg-muted" },
  in_progress: { label: "In progress", variant: "secondary", icon: <Clock className="h-3 w-3" />, bgColor: "bg-highlight/20" },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, bgColor: "bg-primary/20" },
  abandoned: { label: "Abandoned", variant: "destructive", icon: <AlertCircle className="h-3 w-3" />, bgColor: "bg-destructive/20" },
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
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-6 px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary shadow-md">
            <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Your History</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Track your progress and tasks</p>
          </div>
        </div>

        {/* Weekly Stats */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <WeeklyStatsBar stats={weeklyStats} />
          </CardContent>
        </Card>

        {/* History List */}
        {history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-10 sm:py-12">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/50">
                <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </main>
    </>
  );
}
