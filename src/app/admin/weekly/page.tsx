import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyGrid } from "@/components/admin/WeeklyGrid";
import { addDaysToKey, classifyDate, formatDateLabel, startOfWeek, todayInTz, weekDates } from "@/lib/dates";
import { getAttendanceForDates } from "@/lib/queries/attendance";
import { listActiveUsers } from "@/lib/queries/roster";

export default async function WeeklyPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week: weekParam } = await searchParams;
  const weekStart = startOfWeek(weekParam ?? todayInTz());
  const dates = weekDates(weekStart);
  const dayTypes = await Promise.all(dates.map((d) => classifyDate(d)));

  const [users, attendanceMap] = await Promise.all([listActiveUsers(), getAttendanceForDates(dates)]);

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Weekly view</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary text-base font-medium">
            {formatDateLabel(dates[0])} – {formatDateLabel(dates[6])}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/weekly?week=${addDaysToKey(weekStart, -7)}`} />}>
              ← Prev
            </Button>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/weekly" />}>
              This week
            </Button>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/weekly?week=${addDaysToKey(weekStart, 7)}`} />}>
              Next →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <WeeklyGrid dates={dates} dayTypes={dayTypes} users={users} attendanceMap={attendanceMap} />
        </CardContent>
      </Card>
    </>
  );
}
