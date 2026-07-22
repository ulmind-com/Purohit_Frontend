"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutGrid,
  LogOut,
  MapPinned,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/hooks/useAuth";
import type { Role } from "@/types";

const NAV_LINKS: Record<Role, { href: string; label: string; icon: typeof LayoutGrid }[]> = {
  user: [
    { href: "/user", label: "Home", icon: LayoutGrid },
    { href: "/user/book", label: "Book", icon: CalendarClock },
    { href: "/user/bookings", label: "Bookings", icon: MapPinned },
    { href: "/user/profile", label: "Profile", icon: UserIcon },
  ],
  purohit: [
    { href: "/purohit", label: "Home", icon: LayoutGrid },
    { href: "/purohit/bookings", label: "Bookings", icon: MapPinned },
    { href: "/purohit/profile", label: "Profile", icon: Settings },
  ],
};

function isActive(pathname: string, href: string, role: Role) {
  return pathname === href || (href !== `/${role}` && pathname.startsWith(href));
}

export function Navbar({ role }: { role: Role }) {
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);
  const logout = useLogout();
  const links = NAV_LINKS[role];

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : role === "purohit"
      ? "PR"
      : "YJ";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/4">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href={role === "purohit" ? "/purohit" : "/user"}>
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const active = isActive(pathname, link.href, role);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "saffron-gradient text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-8 ring-2 ring-saffron-500/20">
                    <AvatarFallback className="saffron-gradient text-xs text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {profile?.name ?? (role === "purohit" ? "Purohit" : "Yajman")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {profile?.email ?? "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${role}/profile`}>
                    <UserIcon /> Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => logout.mutate()}
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Native-app-style bottom tab bar on mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/60 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-7xl items-stretch justify-around px-2 py-1.5">
          {links.map((link) => {
            const active = isActive(pathname, link.href, role);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5"
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-all",
                    active ? "saffron-gradient text-white shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <link.icon className="size-4.5" />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
