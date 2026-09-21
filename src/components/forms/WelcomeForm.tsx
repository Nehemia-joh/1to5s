"use client";

import { useActionState } from "react";

import { setOwnName } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WelcomeForm() {
  const [state, formAction, pending] = useActionState(setOwnName, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-primary">
          Your name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          autoFocus
          maxLength={100}
          required
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Continue"}
      </Button>
    </form>
  );
}
