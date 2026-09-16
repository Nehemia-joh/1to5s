import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddRosterMemberForm } from "@/components/admin/AddRosterMemberForm";
import { RosterTable } from "@/components/admin/RosterTable";
import { listRoster } from "@/lib/queries/roster";

export default async function RosterPage() {
  const roster = await listRoster();

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Roster</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-base font-medium">Add someone</CardTitle>
        </CardHeader>
        <CardContent>
          <AddRosterMemberForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-base font-medium">Everyone ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <RosterTable roster={roster} />
        </CardContent>
      </Card>
    </>
  );
}
