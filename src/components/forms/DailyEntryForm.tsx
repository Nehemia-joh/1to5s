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
import { Plus, Trash2, GripVertical } from "lucide-react";

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
        <Label className="text-primary font-medium">Today&apos;s tasks</Label>
        <p className="text-xs text-muted-foreground">Add at least one task for today</p>

        <div className="flex flex-col gap-3">
          {rows.map((row, index) => {
            const existingTask = row.id ? existingTaskMap.get(row.id) : null;
            return (
              <div
                key={row.id ?? `new-${index}`}
                className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:gap-2"
              >
                {/* Task number indicator */}
                <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </div>

                {/* Hidden task ID */}
                <input type="hidden" name="taskId" value={row.id ?? ""} />

                {/* Task input */}
                <div className="flex-1 min-w-0">
                  <Input
                    name="taskText"
                    placeholder={`Task ${index + 1}`}
                    value={row.text}
                    onChange={(e) => updateRowText(index, e.target.value)}
                    maxLength={500}
                    className="w-full bg-white"
                  />
                </div>

                {/* Status and metadata row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {existingTask ? (
                    <>
                      <TaskStatusPicker taskId={existingTask.id} initialStatus={existingTask.status} />
                      {existingTask.createdAt ? (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDateTimeLabel(existingTask.createdAt)}
                        </span>
                      ) : null}
                    </>
                  ) : null}

                  {/* Remove button */}
                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline sm:ml-1">Remove</span>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add task button */}
        {rows.length < MAX_TASKS ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="self-start gap-1.5 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add another task
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="blocker" className="text-primary font-medium">
          Blocker
        </Label>
        <Textarea
          id="blocker"
          name="blocker"
          placeholder="Anything in your way? (optional)"
          defaultValue={blocker}
          maxLength={1000}
          className="bg-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="yesterdayComment" className="text-primary font-medium">
          On yesterday
        </Label>
        <Textarea
          id="yesterdayComment"
          name="yesterdayComment"
          placeholder="A note on how yesterday went (optional)"
          defaultValue={yesterdayComment}
          maxLength={1000}
          className="bg-white"
        />
      </div>

      {state?.error ? (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start gap-2">
        {pending ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving…
          </>
        ) : (
          "Save today's 1-5"
        )}
      </Button>
    </form>
  );
}
