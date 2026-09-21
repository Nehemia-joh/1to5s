"use client";

import { useState } from "react";
import { useActionState } from "react";

import { saveEntry } from "@/app/form/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskStatusPicker } from "@/components/forms/TaskStatusPicker";
import { formatDateTimeLabel } from "@/lib/dates";

type ExistingTask = {
  id: number;
  slot: number;
  taskText: string;
  status: string | null;
  createdAt: Date | null;
};

type TaskRow = {
  id: number | null;
  text: string;
};

const MAX_TASKS = 30;

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

  // Initialize rows from existing tasks, always with at least one empty row
  const [rows, setRows] = useState<TaskRow[]>(() => {
    const existing = existingTasks.map((t) => ({ id: t.id, text: t.taskText }));
    if (existing.length === 0) return [{ id: null, text: "" }];
    return [...existing, { id: null, text: "" }];
  });

  const addRow = () => {
    if (rows.length < MAX_TASKS) {
      setRows([...rows, { id: null, text: "" }]);
    }
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    if (newRows.length === 0) {
      newRows.push({ id: null, text: "" });
    }
    setRows(newRows);
  };

  const updateRowText = (index: number, text: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], text };
    setRows(newRows);
  };

  // Map existing tasks by id for quick lookup
  const existingTaskMap = new Map(existingTasks.map((t) => [t.id, t]));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="today" value={today} />

      <div className="flex flex-col gap-3">
        <Label className="text-primary">Today&apos;s tasks (at least one)</Label>
        {rows.map((row, index) => {
          const existingTask = row.id ? existingTaskMap.get(row.id) : null;
          return (
            <div key={row.id ?? `new-${index}`} className="flex items-center gap-2">
              <input type="hidden" name="taskId" value={row.id ?? ""} />
              <Input
                name="taskText"
                placeholder={`Task ${index + 1}`}
                value={row.text}
                onChange={(e) => updateRowText(index, e.target.value)}
                maxLength={500}
                className="flex-1"
              />
              {existingTask ? (
                <>
                  <TaskStatusPicker taskId={existingTask.id} initialStatus={existingTask.status} />
                  {existingTask.createdAt ? (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTimeLabel(existingTask.createdAt)}
                    </span>
                  ) : null}
                </>
              ) : null}
              {rows.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(index)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              ) : null}
            </div>
          );
        })}
        {rows.length < MAX_TASKS ? (
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="self-start">
            + Add another task
          </Button>
        ) : null}
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
