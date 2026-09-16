import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusPicker } from "@/components/forms/TaskStatusPicker";
import type { TaskRow } from "@/lib/queries/entries";

export function PreviousTasksPanel({ dateLabel, tasks }: { dateLabel: string; tasks: TaskRow[] }) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className="border-highlight/60 bg-secondary">
      <CardHeader>
        <CardTitle className="text-primary text-base font-medium">How did {dateLabel} go?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-card p-3">
            <span className="text-sm">{task.taskText}</span>
            <TaskStatusPicker taskId={task.id} initialStatus={task.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
