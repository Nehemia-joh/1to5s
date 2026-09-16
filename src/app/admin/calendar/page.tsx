import { addExtraDay, addHoliday, removeExtraDay, removeHoliday } from "@/app/admin/calendar/actions";
import { CalendarSection } from "@/components/admin/CalendarSection";
import { listExtraDays, listHolidays } from "@/lib/queries/calendar";

export default async function CalendarPage() {
  const [holidays, extraDays] = await Promise.all([listHolidays(), listExtraDays()]);

  return (
    <>
      <h1 className="text-primary text-xl font-medium">Calendar</h1>

      <CalendarSection
        title="Holidays"
        labelPlaceholder="e.g. Independence Day"
        rows={holidays}
        addAction={addHoliday}
        removeAction={removeHoliday}
      />

      <CalendarSection
        title="Extra working days"
        labelPlaceholder="e.g. Launch weekend"
        rows={extraDays}
        addAction={addExtraDay}
        removeAction={removeExtraDay}
      />
    </>
  );
}
