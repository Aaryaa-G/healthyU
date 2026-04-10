"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, FileText, Settings, Database, Users, LogIn, LogOut } from "lucide-react";
import clsx from "clsx";

import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/analytics", label: "Population", Icon: Users },
  { href: "/reports", label: "Reports", Icon: FileText },
  { href: "/architecture", label: "Tech Stack", Icon: Database },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className="w-64 border-r border-foreground/10 bg-background/50 backdrop-blur-md hidden lg:flex flex-col h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
      <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
        <Activity className="w-6 h-6 text-accent" />
        <span className="font-display font-bold uppercase tracking-widest text-sm">
          SH-Platform
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
        {links.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 font-display text-sm tracking-wider uppercase border-l-2",
                isActive
                  ? "bg-foreground/10 text-foreground border-accent"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5 border-transparent hover:border-foreground/30"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-foreground/10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/50 text-accent font-display text-xs">
            {user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="text-xs uppercase font-display tracking-widest leading-tight">
            {user?.email ? user.email.split("@")[0] : "Guest"} <br />
            <span className="text-foreground/50">{isAdmin ? "Admin Access" : user ? "Signed In" : "Not Signed In"}</span>
          </div>
        </div>

        {user ? (
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full inline-flex items-center justify-center gap-2 border border-foreground/10 py-3 text-xs uppercase tracking-[0.24em] font-display hover:bg-foreground/5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-accent" />
            Sign Out
          </button>
        ) : (
          <Link
            href="/auth"
            className="w-full inline-flex items-center justify-center gap-2 border border-foreground/10 py-3 text-xs uppercase tracking-[0.24em] font-display hover:bg-foreground/5 transition-colors"
          >
            <LogIn className="w-4 h-4 text-accent" />
            Admin Login
          </Link>
        )}
      </div>
    </aside>
  );
}
