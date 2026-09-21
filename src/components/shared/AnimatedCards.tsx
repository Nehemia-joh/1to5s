"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { formatDateTimeLabel } from "@/lib/dates";
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode; bgColor: string }> = {
  not_started: { label: "Not started", variant: "outline", icon: <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, bgColor: "bg-muted" },
  in_progress: { label: "In progress", variant: "secondary", icon: <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, bgColor: "bg-highlight/20" },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, bgColor: "bg-primary/20" },
  abandoned: { label: "Abandoned", variant: "destructive", icon: <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />, bgColor: "bg-destructive/20" },
};

type Task = {
  id: number;
  taskText: string;
  status: string | null;
  createdAt: Date | null;
};

type Entry = {
  id: number;
  entryDate: string;
  tasks: Task[];
  blocker: string | null;
  yesterdayComment: string | null;
};

export function AnimatedEntryCard({
  entry,
  index,
  formatDateLabel,
}: {
  entry: Entry;
  index: number;
  formatDateLabel: (date: string) => string;
}) {
  return (
    <AnimatedSection delay={index * 100} animation="fade-up">
      <Card className={`transition-all hover:shadow-md ${index === 0 ? "ring-2 ring-primary/20" : ""}`}>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-sm sm:text-base font-medium">
              {formatDateLabel(entry.entryDate)}
            </CardTitle>
            {index === 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
                Latest
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Tasks */}
          <div className="space-y-2">
            {entry.tasks.map((task, taskIndex) => {
              const statusConfig = task.status ? STATUS_CONFIG[task.status] : null;
              return (
                <AnimatedSection
                  key={task.id}
                  delay={index * 100 + taskIndex * 50}
                  animation="slide-in-left"
                >
                  <div className="rounded-lg bg-muted/30 p-2.5 sm:p-3 transition-all hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full ${statusConfig?.bgColor ?? "bg-muted"} shrink-0`}>
                          {statusConfig?.icon ?? <Circle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                        </div>
                        <span className="text-xs sm:text-sm leading-tight">{task.taskText}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 ml-7 sm:ml-8">
                      {task.createdAt ? (
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                          {formatDateTimeLabel(task.createdAt)}
                        </span>
                      ) : <span />}
                      {statusConfig && (
                        <Badge variant={statusConfig.variant} className="text-[10px] sm:text-xs px-1.5 py-0">
                          {statusConfig.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Comments */}
          {(entry.blocker || entry.yesterdayComment) && (
            <AnimatedSection delay={index * 100 + 200} animation="fade-in">
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
                {entry.blocker ? (
                  <div className="flex items-start gap-2 text-xs sm:text-sm">
                    <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Blocker: </span>
                      <span className="text-muted-foreground">{entry.blocker}</span>
                    </div>
                  </div>
                ) : null}
                {entry.yesterdayComment ? (
                  <div className="flex items-start gap-2 text-xs sm:text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">On yesterday: </span>
                      <span className="text-muted-foreground">{entry.yesterdayComment}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </AnimatedSection>
          )}
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}
