import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatShortDateLabel } from "@/lib/dates";
import { CheckCircle2, Clock, XCircle, Calendar, Ban } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  submitted: { label: "Submitted", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  late: { label: "Late", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  not_submitted: { label: "Not submitted", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  holiday: { label: "Holiday", variant: "outline", icon: <Calendar className="h-3 w-3" /> },
  weekend: { label: "Weekend", variant: "outline", icon: <Calendar className="h-3 w-3" /> },
  skipped: { label: "Skipped", variant: "secondary", icon: <Ban className="h-3 w-3" /> },
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
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Name</TableHead>
              {dates.map((date) => (
                <TableHead key={date} className="text-center min-w-[80px]">{formatShortDateLabel(date)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                {dates.map((date, i) => {
                  const status = attendanceMap.get(`${user.id}:${date}`) ?? (dayTypes[i] === "working" || dayTypes[i] === "extra" ? null : dayTypes[i]);
                  const config = status ? STATUS_CONFIG[status] : null;
                  return (
                    <TableCell key={date} className="text-center">
                      {config ? (
                        <Badge variant={config.variant} className="gap-1 text-xs">
                          {config.icon}
                          <span className="hidden lg:inline">{config.label}</span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border bg-card p-4">
            <h3 className="font-medium text-foreground mb-3">{user.name}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {dates.map((date, i) => {
                const status = attendanceMap.get(`${user.id}:${date}`) ?? (dayTypes[i] === "working" || dayTypes[i] === "extra" ? null : dayTypes[i]);
                const config = status ? STATUS_CONFIG[status] : null;
                return (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{formatShortDateLabel(date)}</span>
                    {config ? (
                      <Badge variant={config.variant} className="gap-1 text-[10px] px-1.5 py-0.5">
                        {config.icon}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
