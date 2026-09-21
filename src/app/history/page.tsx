import { requireUser } from "@/lib/auth-guard";
import { formatDateLabel, startOfWeek, todayInTz } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";
import { getWeeklyTaskStats } from "@/lib/queries/stats";
import { memberLinks, NavBar } from "@/components/layout/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyStatsBar } from "@/components/shared/WeeklyStatsBar";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { AnimatedEntryCard } from "@/components/shared/AnimatedCards";
import { Timer, ClipboardList } from "lucide-react";

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
        <AnimatedSection animation="fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary shadow-md">
              <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Your History</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Track your progress and tasks</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Weekly Stats */}
        <AnimatedSection animation="scale-in" delay={100}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <WeeklyStatsBar stats={weeklyStats} />
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* History List */}
        {history.length === 0 ? (
          <AnimatedSection animation="fade-in" delay={200}>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-10 sm:py-12">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/50">
                  <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {history.map((entry, index) => (
              <AnimatedEntryCard
                key={entry.id}
                entry={entry}
                index={index}
                formatDateLabel={formatDateLabel}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
