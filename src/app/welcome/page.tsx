import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeForm } from "@/components/forms/WelcomeForm";

export default async function WelcomePage() {
  const session = await requireUser();

  // If user already has a name, redirect to form
  if (session.name && session.name.trim()) {
    redirect("/form");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-medium">Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            What&apos;s your name? This will be shown to your team.
          </p>
          <WelcomeForm />
        </CardContent>
      </Card>
    </main>
  );
}
