import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeForm } from "@/components/forms/WelcomeForm";
import { PartyPopper } from "lucide-react";

export default async function WelcomePage() {
  const session = await requireUser();

  if (session.name && session.name.trim()) {
    redirect("/form");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-accent shadow-lg">
            <PartyPopper className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome to Daily 1-5s!</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/70">Let&apos;s get you set up</p>
          </div>
        </div>

        {/* Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-primary text-lg font-semibold">What&apos;s your name?</CardTitle>
            <p className="text-sm text-muted-foreground">
              This will be shown to your team members
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <WelcomeForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
