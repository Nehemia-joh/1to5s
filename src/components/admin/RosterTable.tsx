"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { setRosterActive, setRosterRole, deleteRosterMember } from "@/app/admin/roster/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, UserX, UserCheck, Shield, ShieldOff, Loader2 } from "lucide-react";

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
      className="gap-1.5"
    >
      {active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{active ? "Deactivate" : "Reactivate"}</span>
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
        className="gap-1.5"
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await setRosterRole(userId, role === "admin" ? "member" : "admin");
            if (result?.error) setError(result.error);
          })
        }
      >
        {role === "admin" ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{role === "admin" ? "Demote" : "Make admin"}</span>
      </Button>
      {error ? <p className="max-w-40 text-right text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function DeleteMemberButton({ userId, name }: { userId: number; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          />
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            This will permanently remove this user and all their data including tasks,
            entries, and attendance records. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                setError(null);
                const result = await deleteRosterMember(userId);
                if (result?.error) {
                  setError(result.error);
                } else {
                  setOpen(false);
                }
              });
            }}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
                    <Link href={`/admin/users/${person.id}`} className="text-primary hover:underline font-medium">
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
                      <DeleteMemberButton userId={person.id} name={person.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
          filtered.map((person) => (
            <div key={person.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/users/${person.id}`} className="text-primary hover:underline font-medium block truncate">
                    {person.name}
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">{person.email}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant={person.role === "admin" ? "default" : "outline"}>{person.role}</Badge>
                  <Badge variant={person.active ? "secondary" : "outline"}>{person.active ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToggleRoleButton userId={person.id} role={person.role} />
                <ToggleActiveButton userId={person.id} active={person.active} />
                <DeleteMemberButton userId={person.id} name={person.name} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
