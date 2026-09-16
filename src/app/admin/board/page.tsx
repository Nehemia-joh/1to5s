import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyBoardTable } from "@/components/admin/DailyBoardTable";
import { addDaysToKey, formatDateLabel, todayInTz } from "@/lib/dates";
import { getBoardForDate } from "@/lib/queries/attendance";

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayInTz();
  const rows = await getBoardForDate(date);

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Daily board</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary text-base font-medium">{formatDateLabel(date)}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/board?date=${addDaysToKey(date, -1)}`} />}>
              ← Prev
            </Button>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/board" />}>
              Today
            </Button>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/board?date=${addDaysToKey(date, 1)}`} />}>
              Next →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DailyBoardTable date={date} rows={rows} />
        </CardContent>
      </Card>
    </>
  );
}
