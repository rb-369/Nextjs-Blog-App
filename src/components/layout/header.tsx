"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import UserMenu from "../auth-comp/user-menu";
import ThemeToggle from "../theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  BarChart3,
  Bell,
  Bookmark,
  Compass,
  FileText,
  Menu,
  MoreHorizontal,
  PenSquare,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { label: "Explore", href: "/", icon: Compass },
    { label: "Following", href: "/following", icon: Bell },
    { label: "Write", href: "/post/create", icon: PenSquare },
  ];

  const moreNavItems = [
    { label: "Saved Posts", href: "/saved", icon: Bookmark, description: "Your reading bookmarks" },
    { label: "Your Posts", href: "/yourPosts", icon: FileText, description: "Drafts and published stories" },
    { label: "Search Posts", href: "/search", icon: Search, description: "Filter by topic, tag, or author" },
    { label: "Analytics", href: "/analytics", icon: BarChart3, description: "Post views and audience metrics" },
    { label: "Notifications", href: "/notifications", icon: Bell, description: "Comments and subscriber alerts" },
    { label: "Moderation", href: "/moderation", icon: ShieldCheck, description: "Reports and comment controls" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="group flex items-center gap-2.5 font-bold tracking-tight">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:border-foreground/20 group-hover:shadow-sm dark:border-border/60">
              <Image
                src="/velo_logo_without_bg.svg"
                alt="VELO logo"
                width={32}
                height={32}
                className="h-7 w-auto"
                priority
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              VELO
            </span>
          </Link>

          {/* Desktop Main Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* More (...) Dropdown */}
            <DropdownMenu>
              <div className="relative group flex items-center">
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none cursor-pointer"
                    aria-label="More options"
                    title="More"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/80 bg-popover px-2 py-0.5 text-[10px] font-medium text-popover-foreground shadow-xs opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-50">
                  More
                </span>
              </div>
              <DropdownMenuContent align="start" className="w-56 p-1.5 shadow-lg border-border/80">
                {moreNavItems.map((subItem) => {
                  const isSubActive = pathname === subItem.href;
                  return (
                    <DropdownMenuItem key={subItem.href} asChild className="cursor-pointer rounded-md">
                      <Link
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 text-sm",
                          isSubActive && "bg-muted font-semibold text-foreground"
                        )}
                      >
                        <subItem.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col leading-tight">
                          <span>{subItem.label}</span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {subItem.description}
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right: Search, Theme Toggle & User Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search Shortcut */}
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search posts...</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth State */}
          <div className="flex items-center">
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Button asChild size="sm" className="font-semibold cursor-pointer">
                <Link href="/auth">Log in</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border md:hidden text-foreground hover:bg-muted"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 p-4 backdrop-blur md:hidden">
          <div className="space-y-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5 text-sm font-medium text-foreground mb-3"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>Search posts & topics</span>
            </Link>

            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Primary
            </p>
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            <p className="pt-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Creator Studio & Tools
            </p>
            {moreNavItems.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === subItem.href ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <subItem.icon className="h-4 w-4" />
                <span>{subItem.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}