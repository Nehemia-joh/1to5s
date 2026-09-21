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
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { AnimatedEntryCard } from "@/components/shared/AnimatedCards";
import { User, Mail, ArrowLeft, ClipboardList } from "lucide-react";
import Link from "next/link";

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
      <AnimatedSection animation="fade-in">
        <Link
          href="/admin/roster"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to roster
        </Link>
      </AnimatedSection>

      {/* User Header */}
      <AnimatedSection animation="fade-up" delay={100}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-float">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
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
      </AnimatedSection>

      {/* Weekly Stats */}
      <AnimatedSection animation="scale-in" delay={200}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent card-glow">
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
      </AnimatedSection>

      {/* History */}
      {history.length === 0 ? (
        <AnimatedSection animation="fade-in" delay={300}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 animate-float">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No 1-5s submitted yet.</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <>
          <AnimatedSection animation="fade-up" delay={300}>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submission History
            </h2>
          </AnimatedSection>

          <div className="flex flex-col gap-4">
            {history.map((entry, index) => (
              <AnimatedEntryCard
                key={entry.id}
                entry={entry}
                index={index}
                formatDateLabel={formatDateLabel}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
