"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkipDialog } from "@/components/admin/SkipDialog";
import type { BoardRow } from "@/lib/queries/attendance";
import { User, Clock, CheckCircle2, AlertCircle, XCircle, Ban, Calendar } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  submitted: { label: "Submitted", variant: "secondary", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  late: { label: "Late", variant: "outline", icon: <Clock className="h-3.5 w-3.5" /> },
  not_submitted: { label: "Not submitted", variant: "destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
  holiday: { label: "Holiday", variant: "outline", icon: <Calendar className="h-3.5 w-3.5" /> },
  weekend: { label: "Weekend", variant: "outline", icon: <Calendar className="h-3.5 w-3.5" /> },
  skipped: { label: "Skipped", variant: "secondary", icon: <Ban className="h-3.5 w-3.5" /> },
};

export function DailyBoardTable({ date, rows }: { date: string; rows: BoardRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        placeholder="Search by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No one matches &quot;{query}&quot;.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const status = row.status ?? "not_submitted";
                const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_submitted;
                const canSkip = status === "late" || status === "not_submitted";
                return (
                  <TableRow key={row.userId}>
                    <TableCell>
                      <Link href={`/admin/users/${row.userId}`} className="text-primary hover:underline font-medium">
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.reason ?? ""}</TableCell>
                    <TableCell className="text-right">
                      {canSkip ? <SkipDialog userId={row.userId} name={row.name} date={date} /> : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No one matches &quot;{query}&quot;
          </p>
        ) : (
          filtered.map((row) => {
            const status = row.status ?? "not_submitted";
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_submitted;
            const canSkip = status === "late" || status === "not_submitted";
            return (
              <div key={row.userId} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/admin/users/${row.userId}`} className="text-primary hover:underline font-medium truncate">
                    {row.name}
                  </Link>
                  <Badge variant={config.variant} className="gap-1 shrink-0">
                    {config.icon}
                    {config.label}
                  </Badge>
                </div>
                {row.reason ? (
                  <p className="text-sm text-muted-foreground">{row.reason}</p>
                ) : null}
                {canSkip ? (
                  <div className="pt-1">
                    <SkipDialog userId={row.userId} name={row.name} date={date} />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
