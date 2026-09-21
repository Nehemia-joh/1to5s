import Image from "next/image";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeForm } from "@/components/forms/WelcomeForm";

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
          <Image
            src="/icon.png"
            alt="Daily 1-5s"
            width={64}
            height={64}
            className="rounded-full shadow-lg"
            priority
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome to Daily 1-5s! 🎉</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/70">Let&apos;s get you set up</p>
          </div>
        </div>

        {/* Encouragement */}
        <p className="text-center text-white/80 text-sm">
          You&apos;re one step away from crushing your daily goals!
        </p>

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
