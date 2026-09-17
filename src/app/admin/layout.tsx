import { requireAdmin } from "@/lib/auth-guard";
import { NavBar } from "@/components/layout/NavBar";

const ADMIN_LINKS = [
  { href: "/form", label: "My 1-5" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/weekly", label: "Weekly" },
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/logs", label: "Logs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <>
      <NavBar name={session.name} links={ADMIN_LINKS} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">{children}</main>
    </>
  );
}
