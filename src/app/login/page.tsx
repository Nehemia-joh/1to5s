import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/LoginForm";
import { ClipboardList } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-brand-accent shadow-lg">
            <ClipboardList className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily 1-5s</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/70">Your daily standup, simplified</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-primary text-lg sm:text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-sm">Sign in with your work email to continue</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-white/50">
          Silverleaf Technologies
        </p>
      </div>
    </main>
  );
}
