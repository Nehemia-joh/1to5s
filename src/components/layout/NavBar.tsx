import Link from "next/link";

import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, History, Settings, CalendarDays, Users, ClipboardList, BarChart3 } from "lucide-react";

/** Nav links for /form and /history — adds a way back to the admin section for admins. */
export function memberLinks(isAdmin: boolean) {
  const links = [
    { href: "/form", label: "Today" },
    { href: "/history", label: "History" },
  ];
  return isAdmin ? [...links, { href: "/admin/board", label: "Admin" }] : links;
}

const ADMIN_ICON_MAP: Record<string, React.ReactNode> = {
  "/form": <ClipboardList className="h-4 w-4" />,
  "/admin/board": <BarChart3 className="h-4 w-4" />,
  "/admin/weekly": <BarChart3 className="h-4 w-4" />,
  "/admin/roster": <Users className="h-4 w-4" />,
  "/admin/calendar": <CalendarDays className="h-4 w-4" />,
  "/admin/settings": <Settings className="h-4 w-4" />,
  "/admin/logs": <ClipboardList className="h-4 w-4" />,
};

export function NavBar({ name, links }: { name: string; links: { href: string; label: string }[] }) {
  return (
    <header className="bg-primary shadow-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent">
              <span className="text-primary text-sm font-bold">1-5</span>
            </div>
            <span className="text-white font-semibold hidden sm:inline">Daily 1-5s</span>
          </Link>
          <nav className="flex gap-1">
            {links.map((link) => {
              const icon = ADMIN_ICON_MAP[link.href];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
                >
                  {icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-primary text-xs font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/90 hidden sm:inline">{name}</span>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
