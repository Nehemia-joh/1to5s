import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatShortDateLabel } from "@/lib/dates";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  late: "Late",
  missed: "Missed",
  holiday: "Holiday",
  weekend: "Weekend",
  skipped: "Skipped",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  submitted: "secondary",
  late: "outline",
  missed: "destructive",
  holiday: "outline",
  weekend: "outline",
  skipped: "secondary",
};

export function WeeklyGrid({
  dates,
  dayTypes,
  users,
  attendanceMap,
}: {
  dates: string[];
  dayTypes: string[];
  users: { id: number; name: string }[];
  attendanceMap: Map<string, string>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {dates.map((date) => (
            <TableHead key={date}>{formatShortDateLabel(date)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            {dates.map((date, i) => {
              const status = attendanceMap.get(`${user.id}:${date}`) ?? (dayTypes[i] === "working" || dayTypes[i] === "extra" ? null : dayTypes[i]);
              return (
                <TableCell key={date}>
                  {status ? <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{STATUS_LABELS[status] ?? status}</Badge> : <span className="text-muted-foreground">—</span>}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
