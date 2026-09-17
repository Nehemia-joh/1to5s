"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { setRosterActive, setRosterRole } from "@/app/admin/roster/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RosterRow = {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  active: boolean;
};

function ToggleActiveButton({ userId, active }: { userId: number; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={active ? "ghost" : "secondary"}
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => setRosterActive(userId, !active))}
    >
      {active ? "Deactivate" : "Reactivate"}
    </Button>
  );
}

function ToggleRoleButton({ userId, role }: { userId: number; role: "member" | "admin" }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await setRosterRole(userId, role === "admin" ? "member" : "admin");
            if (result?.error) setError(result.error);
          })
        }
      >
        {role === "admin" ? "Remove admin" : "Make admin"}
      </Button>
      {error ? <p className="max-w-40 text-right text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function RosterTable({ roster }: { roster: RosterRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((person) => person.name.toLowerCase().includes(q) || person.email.toLowerCase().includes(q));
  }, [roster, query]);

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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No one matches &quot;{query}&quot;.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <Link href={`/admin/users/${person.id}`} className="text-primary hover:underline">
                      {person.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{person.email}</TableCell>
                  <TableCell>
                    <Badge variant={person.role === "admin" ? "default" : "outline"}>{person.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={person.active ? "secondary" : "outline"}>{person.active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ToggleRoleButton userId={person.id} role={person.role} />
                      <ToggleActiveButton userId={person.id} active={person.active} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
