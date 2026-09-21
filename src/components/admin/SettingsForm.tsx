"use client";

import { useTransition } from "react";

import { setTaskCarryover } from "@/app/admin/settings/actions";
import { Button } from "@/components/ui/button";

export function SettingsForm({ initialEnabled }: { initialEnabled: boolean }) {
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await setTaskCarryover(!initialEnabled);
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant={initialEnabled ? "default" : "outline"}
        disabled={pending}
        onClick={handleToggle}
        className="min-w-[120px]"
      >
        {pending ? "Saving..." : initialEnabled ? "Enabled" : "Disabled"}
      </Button>
      <span className="text-sm text-muted-foreground">
        {initialEnabled ? "Carryover is active" : "Carryover is turned off"}
      </span>
    </div>
  );
}
