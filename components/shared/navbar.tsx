"use client";

import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarClock,
  LayoutGrid,
  Map,
  MapPinned,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
  Users,
  Building2,
  Flame,
  Disc,
  Banknote,
  LogOut,
  BookOpen,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const NAV_LINKS: Record<Role, { href: string; label: any; icon: typeof LayoutGrid }[]> = {
  user: [
    { href: "/user", label: "home", icon: LayoutGrid },
    { href: "/search", label: "search", icon: Search },
    { href: "/darshan", label: "darshan", icon: Flame },
    { href: "/library", label: "library", icon: BookOpen },
    { href: "/user/book", label: "book", icon: CalendarClock },
    { href: "/user/bookings", label: "bookings", icon: MapPinned },
    { href: "/user/jap-mala", label: "japMala", icon: Disc },
    { href: "/user/profile", label: "profile", icon: UserIcon },
  ],
  purohit: [
    { href: "/purohit", label: "home", icon: LayoutGrid },
    { href: "/darshan", label: "darshan", icon: Flame },
    { href: "/library", label: "library", icon: BookOpen },
    { href: "/purohit/zones", label: "zones", icon: Map },
    { href: "/purohit/bookings", label: "bookings", icon: MapPinned },
    { href: "/user/jap-mala", label: "japMala", icon: Disc },
    { href: "/purohit/payment-settings", label: "payouts", icon: Banknote },
    { href: "/purohit/profile", label: "profile", icon: Settings },
  ],
  SUPER_ADMIN: [
    { href: "/admin", label: "home", icon: LayoutGrid },
    { href: "/admin/users", label: "users", icon: Users },
    { href: "/admin/purohits", label: "purohits", icon: UserIcon },
    { href: "/admin/financials", label: "financials", icon: Banknote },
    { href: "/admin/settings", label: "settings", icon: Settings },
  ],
};

function isActive(pathname: string, href: string, role: Role) {
  return pathname === href || (href !== `/${role}` && pathname.startsWith(href));
}

export function Navbar({ role }: { role: Role }) {
  const t = useTranslations("Navigation");
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
                    {t(link.label)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-8 ring-2 ring-saffron-500/20">
                    {(profile as any)?.profile_picture && (
                      <AvatarImage key={(profile as any).profile_picture} src={(profile as any).profile_picture} alt={profile?.name || ""} />
                    )}
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
                    <UserIcon /> {t("profileSettings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => logout.mutate()}
                >
                  <LogOut /> {t("signOut")}
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
                  {t(link.label)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
