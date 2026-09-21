import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/icon.png"
            alt="Daily 1-5s"
            width={80}
            height={80}
            className="rounded-2xl shadow-lg"
            priority
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily 1-5s</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/70">Your daily standup, simplified</p>
          </div>
        </div>

        {/* Encouraging message */}
        <div className="text-center px-4">
          <p className="text-white/90 text-sm sm:text-base font-medium">
            🚀 Every great day starts with a plan
          </p>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            Log in to set your tasks and track your progress
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-primary text-lg sm:text-xl font-semibold">Welcome back!</CardTitle>
            <CardDescription className="text-sm">Sign in with your work email to get started</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Motivational footer */}
        <div className="text-center space-y-2">
          <p className="text-white/50 text-xs">
            💡 Tip: Submit your 1-5 before 9:30 AM to stay on track
          </p>
          <p className="text-white/40 text-xs">
            Silverleaf Technologies
          </p>
        </div>
      </div>
    </main>
  );
}
