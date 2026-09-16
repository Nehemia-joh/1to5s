import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeLabel } from "@/lib/dates";
import { listAuditLog } from "@/lib/queries/audit";

function describeMetadata(metadata: unknown): string {
  if (!metadata || typeof metadata !== "object") return "";
  return Object.entries(metadata as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

export default async function LogsPage() {
  const logs = await listAuditLog();

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-base font-medium">Recent activity ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTimeLabel(log.createdAt)}</TableCell>
                    <TableCell>{log.actorName ?? "System (cron)"}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[log.targetType && log.targetId ? `${log.targetType} ${log.targetId}` : null, describeMetadata(log.metadata)]
                        .filter(Boolean)
                        .join(" — ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
