"use client"

import {
  Bell,
  Calendar,
  LogOut,
  Moon,
  Search,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useLogout, useSession } from "@/hooks/use-auth"
import { type Section, sectionTitles } from "@/lib/dashboard-config"
import { cn } from "@/lib/utils"

interface HeaderProps {
  activeSection: Section
}

export function Header({ activeSection }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { data: user } = useSession()
  const logout = useLogout()

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || ""

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-foreground">
          {sectionTitles[activeSection]}
        </h1>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div
          className={cn(
            "relative flex items-center transition-all duration-300",
            searchFocused ? "w-64" : "w-48",
          )}
        >
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-4 bg-secondary border-border focus-visible:ring-ring/20 focus-visible:border-accent transition-all duration-200"
          />
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {mounted &&
            (isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            ))}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="relative text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="font-semibold text-sm px-2 py-1.5">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 my-1">
              <div className="flex items-start gap-2.5 p-2 rounded-md hover:bg-secondary/60 text-xs transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Pipeline synchronized</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">All deals and forecasted revenue are up to date.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-md hover:bg-secondary/60 text-xs transition-colors">
                <div className="w-2 h-2 rounded-full bg-chart-1 mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Customer accounts active</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Enterprise customer health scores refreshed.</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar & Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="rounded-full overflow-hidden bg-secondary ring-2 ring-transparent hover:ring-accent/50 hover:bg-secondary p-0 cursor-pointer"
            >
              {!mounted ? (
                <div className="w-full h-full bg-muted animate-pulse rounded-full" />
              ) : (
                <Avatar className="w-full h-full">
                  <AvatarFallback className="bg-linear-to-br from-accent/80 to-chart-1 text-accent-foreground font-semibold text-xs">
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {user?.role && (
                  <Badge variant="outline" className="w-fit mt-1.5 text-[10px] uppercase font-semibold">
                    {user.role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{logout.isPending ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
