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
import { Plus, Trash2 } from "lucide-react";

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

  const existingTaskMap = new Map(existingTasks.map((t) => [t.id, t]));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="today" value={today} />

      {/* Tasks Section */}
      <div className="flex flex-col gap-2">
        <Label className="text-primary font-medium text-base">Today&apos;s tasks</Label>
        <p className="text-xs text-muted-foreground mb-1">Add at least one task for today</p>

        <div className="flex flex-col gap-3">
          {rows.map((row, index) => {
            const existingTask = row.id ? existingTaskMap.get(row.id) : null;
            return (
              <div
                key={row.id ?? `new-${index}`}
                className="rounded-lg border bg-white p-3 shadow-sm"
              >
                {/* Task number and input */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-medium shrink-0">
                    {index + 1}
                  </div>
                  <input type="hidden" name="taskId" value={row.id ?? ""} />
                  <Input
                    name="taskText"
                    placeholder={`Task ${index + 1}`}
                    value={row.text}
                    onChange={(e) => updateRowText(index, e.target.value)}
                    maxLength={500}
                    className="flex-1 h-10 text-sm"
                  />
                </div>

                {/* Status and actions row */}
                <div className="flex items-center justify-between gap-2 ml-8">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {existingTask ? (
                      <>
                        <TaskStatusPicker taskId={existingTask.id} initialStatus={existingTask.status} />
                        {existingTask.createdAt ? (
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">
                            {formatDateTimeLabel(existingTask.createdAt)}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {rows.length < MAX_TASKS ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="self-start gap-1.5 border-dashed mt-1"
          >
            <Plus className="h-4 w-4" />
            Add another task
          </Button>
        ) : null}
      </div>

      {/* Blocker */}
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
          className="bg-white min-h-[80px]"
        />
      </div>

      {/* Yesterday Comment */}
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
          className="bg-white min-h-[80px]"
        />
      </div>

      {/* Error */}
      {state?.error ? (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      {/* Submit */}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto self-start gap-2 h-11">
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
