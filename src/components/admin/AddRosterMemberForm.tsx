"use client";

import { useActionState } from "react";

import { addRosterMember } from "@/app/admin/roster/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddRosterMemberForm() {
  const [state, formAction, pending] = useActionState(addRosterMember, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Jane Doe" required className="w-48" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="jane@silverleaf.co.tz" required className="w-64" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add to roster"}
      </Button>
      {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
