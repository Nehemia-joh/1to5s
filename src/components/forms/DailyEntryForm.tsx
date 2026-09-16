"use client";

import { useActionState } from "react";

import { saveEntry } from "@/app/form/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DailyEntryForm({
  today,
  initial,
}: {
  today: string;
  initial: {
    task1: string;
    task2: string;
    task3: string;
    blocker: string;
    yesterdayComment: string;
  };
}) {
  const [state, formAction, pending] = useActionState(saveEntry, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="today" value={today} />

      <div className="flex flex-col gap-3">
        <Label className="text-primary">Today (pick at least one)</Label>
        <Input name="task1" placeholder="Task 1" defaultValue={initial.task1} maxLength={500} />
        <Input name="task2" placeholder="Task 2" defaultValue={initial.task2} maxLength={500} />
        <Input name="task3" placeholder="Task 3" defaultValue={initial.task3} maxLength={500} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="blocker" className="text-primary">
          Blocker
        </Label>
        <Textarea id="blocker" name="blocker" placeholder="Anything in your way? (optional)" defaultValue={initial.blocker} maxLength={1000} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="yesterdayComment" className="text-primary">
          On yesterday
        </Label>
        <Textarea
          id="yesterdayComment"
          name="yesterdayComment"
          placeholder="A note on how yesterday went (optional)"
          defaultValue={initial.yesterdayComment}
          maxLength={1000}
        />
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save today's 1-5"}
      </Button>
    </form>
  );
}
