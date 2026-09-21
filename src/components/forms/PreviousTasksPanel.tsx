"use client";

import { useTransition } from "react";

import { carryTaskToToday } from "@/app/form/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusPicker } from "@/components/forms/TaskStatusPicker";
import { formatDateTimeLabel } from "@/lib/dates";
import type { TaskRow } from "@/lib/queries/entries";

export function PreviousTasksPanel({
  dateLabel,
  tasks,
  carryoverEnabled,
}: {
  dateLabel: string;
  tasks: TaskRow[];
  carryoverEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (tasks.length === 0) {
    return null;
  }

  const handleCarry = (taskId: number) => {
    startTransition(async () => {
      await carryTaskToToday(taskId);
    });
  };

  return (
    <Card className="border-highlight/60 bg-secondary">
      <CardHeader>
        <CardTitle className="text-primary text-base font-medium">How did {dateLabel} go?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tasks.map((task) => {
          const canCarry = carryoverEnabled && (!task.status || task.status === "not_started" || task.status === "in_progress");
          return (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-card p-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm truncate">{task.taskText}</span>
                {task.createdAt ? (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTimeLabel(task.createdAt)}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <TaskStatusPicker taskId={task.id} initialStatus={task.status} />
                {canCarry ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleCarry(task.id)}
                  >
                    Carry to today
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
