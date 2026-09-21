import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/LoginForm";
import { ClipboardList } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-accent shadow-lg">
            <ClipboardList className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Daily 1-5s</h1>
            <p className="mt-2 text-white/70">Your daily standup, simplified</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-primary text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription>Sign in with your work email to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-white/50">
          Silverleaf Technologies
        </p>
      </div>
    </main>
  );
}
