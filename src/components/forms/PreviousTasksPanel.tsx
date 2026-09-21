"use client";

import { useTransition } from "react";

import { carryTaskToToday } from "@/app/form/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusPicker } from "@/components/forms/TaskStatusPicker";
import { formatDateTimeLabel } from "@/lib/dates";
import type { TaskRow } from "@/lib/queries/entries";
import { ArrowRight, Clock } from "lucide-react";

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
    <Card className="border-highlight/60 bg-gradient-to-br from-highlight/10 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          How did {dateLabel} go?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {tasks.map((task) => {
          const canCarry = carryoverEnabled && (!task.status || task.status === "not_started" || task.status === "in_progress");

          return (
            <div
              key={task.id}
              className="rounded-lg bg-white p-3 shadow-sm space-y-2"
            >
              {/* Task text */}
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1 min-w-0">{task.taskText}</span>
                {task.createdAt ? (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDateTimeLabel(task.createdAt)}
                  </span>
                ) : null}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 flex-wrap">
                <TaskStatusPicker taskId={task.id} initialStatus={task.status} />
                {canCarry ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleCarry(task.id)}
                    className="gap-1.5"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
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
