import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRosterMemberForm } from "@/components/admin/AddRosterMemberForm";
import { ImportRosterForm } from "@/components/admin/ImportRosterForm";
import { RosterTable } from "@/components/admin/RosterTable";
import { listRoster } from "@/lib/queries/roster";

export default async function RosterPage() {
  const roster = await listRoster();

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Roster</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-base font-medium">Add people</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="one">
            <TabsList>
              <TabsTrigger value="one">One at a time</TabsTrigger>
              <TabsTrigger value="import">Import from Excel/CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="one" className="pt-4">
              <AddRosterMemberForm />
            </TabsContent>
            <TabsContent value="import" className="pt-4">
              <ImportRosterForm />
            </TabsContent>
          </Tabs>
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
