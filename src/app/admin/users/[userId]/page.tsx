import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateLabel } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const id = Number(userId);
  if (!Number.isInteger(id)) notFound();

  const [person] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!person) notFound();

  const history = await getUserHistory(id);

  return (
    <>
      <div className="flex items-center gap-3">
        <h1 className="text-primary text-xl font-medium">{person.name}</h1>
        <Badge variant={person.active ? "secondary" : "outline"}>{person.active ? "Active" : "Inactive"}</Badge>
        <Badge variant={person.role === "admin" ? "default" : "outline"}>{person.role}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{person.email}</p>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No 1-5s submitted yet.</p>
      ) : (
        history.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle className="text-primary text-base font-medium">{formatDateLabel(entry.entryDate)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <ul className="flex flex-col gap-1.5">
                {entry.tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-2">
                    <span>{task.taskText}</span>
                    {task.status ? <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge> : null}
                  </li>
                ))}
              </ul>
              {entry.blocker ? (
                <p>
                  <span className="text-muted-foreground">Blocker: </span>
                  {entry.blocker}
                </p>
              ) : null}
              {entry.yesterdayComment ? (
                <p>
                  <span className="text-muted-foreground">On yesterday: </span>
                  {entry.yesterdayComment}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </>
  );
}
