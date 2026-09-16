"use client";

import { useActionState, useState } from "react";

import { markAttendanceSkipped } from "@/app/admin/board/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SkipDialog({ userId, name, date }: { userId: number; name: string; date: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(markAttendanceSkipped, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>Mark as skipped</DialogTrigger>
      <DialogContent>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Mark {name} as skipped</DialogTitle>
            <DialogDescription>A reason is required for {date}.</DialogDescription>
          </DialogHeader>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="date" value={date} />
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" name="reason" required maxLength={500} />
            {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
