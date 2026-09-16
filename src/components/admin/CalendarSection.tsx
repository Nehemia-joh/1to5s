"use client";

import { useActionState, useTransition } from "react";

import type { CalendarState } from "@/app/admin/calendar/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CalendarRow = { id: number; date: string; label: string | null };

export function CalendarSection({
  title,
  labelPlaceholder,
  rows,
  addAction,
  removeAction,
}: {
  title: string;
  labelPlaceholder: string;
  rows: CalendarRow[];
  addAction: (prevState: CalendarState, formData: FormData) => Promise<CalendarState>;
  removeAction: (id: number) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(addAction, undefined);
  const [removing, startRemoving] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${title}-date`}>Date</Label>
            <Input id={`${title}-date`} name="date" type="date" required className="w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${title}-label`}>Label</Label>
            <Input id={`${title}-label`} name="label" placeholder={labelPlaceholder} required className="w-56" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add"}
          </Button>
          {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
        </form>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <span>
                  <span className="font-medium">{row.date}</span> — {row.label}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={removing}
                  onClick={() => startRemoving(() => removeAction(row.id))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
