"use client";

import { useTransition } from "react";

import { carryTaskToToday } from "@/app/form/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusPicker } from "@/components/forms/TaskStatusPicker";
import { formatDateTimeLabel } from "@/lib/dates";
import type { TaskRow } from "@/lib/queries/entries";
import { ArrowRight, CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-primary" />,
  in_progress: <Clock className="h-4 w-4 text-highlight" />,
  not_started: <Circle className="h-4 w-4 text-muted-foreground" />,
  abandoned: <AlertCircle className="h-4 w-4 text-destructive" />,
};

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
          const statusIcon = task.status ? STATUS_ICONS[task.status] : null;

          return (
            <div
              key={task.id}
              className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Task info */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {statusIcon}
                <span className="text-sm truncate flex-1">{task.taskText}</span>
                {task.createdAt ? (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">
                    {formatDateTimeLabel(task.createdAt)}
                  </span>
                ) : null}
              </div>

              {/* Actions */}
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
