"use client";

import { useActionState } from "react";

import { saveEntry } from "@/app/form/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskStatusPicker } from "@/components/forms/TaskStatusPicker";

type ExistingTask = { id: number; slot: number; taskText: string; status: string | null };

export function DailyEntryForm({
  today,
  existingTasks,
  blocker,
  yesterdayComment,
}: {
  today: string;
  existingTasks: ExistingTask[];
  blocker: string;
  yesterdayComment: string;
}) {
  const [state, formAction, pending] = useActionState(saveEntry, undefined);
  const taskBySlot = (slot: number) => existingTasks.find((t) => t.slot === slot);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="today" value={today} />

      <div className="flex flex-col gap-3">
        <Label className="text-primary">Today (pick at least one)</Label>
        {[1, 2, 3].map((slot) => {
          const task = taskBySlot(slot);
          return (
            <div key={slot} className="flex items-center gap-2">
              <Input name={`task${slot}`} placeholder={`Task ${slot}`} defaultValue={task?.taskText ?? ""} maxLength={500} className="flex-1" />
              {task ? <TaskStatusPicker taskId={task.id} initialStatus={task.status} /> : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="blocker" className="text-primary">
          Blocker
        </Label>
        <Textarea id="blocker" name="blocker" placeholder="Anything in your way? (optional)" defaultValue={blocker} maxLength={1000} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="yesterdayComment" className="text-primary">
          On yesterday
        </Label>
        <Textarea
          id="yesterdayComment"
          name="yesterdayComment"
          placeholder="A note on how yesterday went (optional)"
          defaultValue={yesterdayComment}
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
