import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeForm } from "@/components/forms/WelcomeForm";
import { PartyPopper } from "lucide-react";

export default async function WelcomePage() {
  const session = await requireUser();

  // If user already has a name, redirect to form
  if (session.name && session.name.trim()) {
    redirect("/form");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent shadow-lg">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome to Daily 1-5s!</h1>
            <p className="mt-2 text-white/70">Let&apos;s get you set up</p>
          </div>
        </div>

        {/* Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-primary text-lg font-semibold">What&apos;s your name?</CardTitle>
            <p className="text-sm text-muted-foreground">
              This will be shown to your team members
            </p>
          </CardHeader>
          <CardContent>
            <WelcomeForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
