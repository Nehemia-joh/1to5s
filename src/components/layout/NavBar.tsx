"use client";

import Link from "next/link";
import { useState } from "react";

import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, History, Settings, CalendarDays, Users, ClipboardList, BarChart3, Menu, X } from "lucide-react";

/** Nav links for /form and /history */
export function memberLinks(isAdmin: boolean) {
  const links = [
    { href: "/form", label: "Today", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/history", label: "History", icon: <History className="h-4 w-4" /> },
  ];
  return isAdmin ? [...links, { href: "/admin/board", label: "Admin", icon: <LayoutDashboard className="h-4 w-4" /> }] : links;
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent">
            <span className="text-primary text-sm font-bold">1-5</span>
          </div>
          <span className="text-white font-semibold hidden sm:inline">Daily 1-5s</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1">
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

        {/* Desktop User */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-primary text-xs font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/90">{name}</span>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white gap-1.5">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-2">
          {/* User info */}
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent text-primary text-sm font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/90">{name}</span>
          </div>

          {/* Nav links */}
          {links.map((link) => {
            const icon = ADMIN_ICON_MAP[link.href];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                {icon}
                {link.label}
              </Link>
            );
          })}

          {/* Logout */}
          <form action={logout} className="pt-2 border-t border-white/10">
            <Button type="submit" variant="ghost" size="sm" className="w-full text-white/80 hover:bg-white/10 hover:text-white justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
