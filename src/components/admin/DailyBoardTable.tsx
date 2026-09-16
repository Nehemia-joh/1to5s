import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkipDialog } from "@/components/admin/SkipDialog";
import type { BoardRow } from "@/lib/queries/attendance";

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

export function DailyBoardTable({ date, rows }: { date: string; rows: BoardRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const status = row.status ?? "not_submitted";
          const canSkip = status === "late" || status === "missed";
          return (
            <TableRow key={row.userId}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{STATUS_LABELS[status] ?? "Not submitted yet"}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.reason ?? ""}</TableCell>
              <TableCell className="text-right">
                {canSkip ? <SkipDialog userId={row.userId} name={row.name} date={date} /> : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
