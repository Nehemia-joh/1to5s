"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkipDialog } from "@/components/admin/SkipDialog";
import type { BoardRow } from "@/lib/queries/attendance";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  late: "Late",
  not_submitted: "Not submitted",
  holiday: "Holiday",
  weekend: "Weekend",
  skipped: "Skipped",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  submitted: "secondary",
  late: "outline",
  not_submitted: "destructive",
  holiday: "outline",
  weekend: "outline",
  skipped: "secondary",
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

      <div className="overflow-x-auto">
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
                const canSkip = status === "late" || status === "not_submitted";
                return (
                  <TableRow key={row.userId}>
                    <TableCell>
                      <Link href={`/admin/users/${row.userId}`} className="text-primary hover:underline">
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{STATUS_LABELS[status] ?? "Not submitted yet"}</Badge>
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
    </div>
  );
}
