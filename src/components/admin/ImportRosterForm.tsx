"use client";

import { useActionState } from "react";

import { importRosterFromExcel } from "@/app/admin/roster/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImportRosterForm() {
  const [state, formAction, pending] = useActionState(importRosterFromExcel, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="file">Excel or CSV file</Label>
          <Input id="file" name="file" type="file" accept=".xlsx,.xls,.csv" required className="w-64" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Importing…" : "Import"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Columns: <strong>Name</strong>, <strong>Email</strong>, and optionally <strong>Role</strong> — leave Role blank for a
        regular member, or put &quot;admin&quot; in it to make that person an admin.
      </p>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.summary ? (
        <div className="text-sm">
          <p>
            Added <strong>{state.summary.created}</strong>, skipped <strong>{state.summary.skipped}</strong> already on the
            roster, {state.summary.invalid} invalid row{state.summary.invalid === 1 ? "" : "s"}.
          </p>
          {state.summary.invalidRows.length > 0 ? (
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {state.summary.invalidRows.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
