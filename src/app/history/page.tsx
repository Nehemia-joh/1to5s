import { requireUser } from "@/lib/auth-guard";
import { formatDateLabel } from "@/lib/dates";
import { getUserHistory } from "@/lib/queries/entries";
import { NavBar } from "@/components/layout/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export default async function HistoryPage() {
  const session = await requireUser();
  const userId = Number(session.sub);
  const history = await getUserHistory(userId);

  return (
    <>
      <NavBar name={session.name} links={[{ href: "/form", label: "Today" }, { href: "/history", label: "History" }]} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <h1 className="text-primary text-xl font-medium">Your history</h1>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
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
      </main>
    </>
  );
}
