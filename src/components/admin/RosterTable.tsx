"use client";

import Link from "next/link";
import { useTransition } from "react";

import { setRosterActive } from "@/app/admin/roster/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function RosterTable({ roster }: { roster: RosterRow[] }) {
  return (
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
        {roster.map((person) => (
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
              <ToggleActiveButton userId={person.id} active={person.active} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
