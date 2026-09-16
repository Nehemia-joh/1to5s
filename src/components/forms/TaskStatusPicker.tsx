"use client";

import { useTransition } from "react";

import { markPreviousTaskStatus } from "@/app/form/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export function TaskStatusPicker({ taskId, initialStatus }: { taskId: number; initialStatus: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={initialStatus ?? undefined}
      onValueChange={(value) => {
        if (!value) return;
        startTransition(async () => {
          await markPreviousTaskStatus(taskId, value);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-40" disabled={pending}>
        <SelectValue placeholder="Not yet marked">{(value: string | null) => (value ? STATUS_LABELS[value] : "Not yet marked")}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
