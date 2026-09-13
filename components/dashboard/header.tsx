"use client"

import { Bell, Calendar, Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { type Section, sectionTitles } from "@/lib/dashboard-config"
import { useSession, useLogout } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  activeSection: Section
}

export function Header({ activeSection }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { data: user, isPending } = useSession()
  const logout = useLogout()

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
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
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
          />
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
        >
          {mounted &&
            (isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            ))}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </Button>

        {/* User avatar & Logout */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => logout.mutate()}
          title="Click to logout"
          disabled={isPending}
          className="rounded-lg overflow-hidden bg-secondary ring-2 ring-transparent hover:ring-accent/50 hover:bg-secondary p-0"
        >
          {isPending ? (
            <div className="w-full h-full bg-muted animate-pulse" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-accent/80 to-chart-1 flex items-center justify-center text-xs font-semibold text-accent-foreground">
              {initials || "U"}
            </div>
          )}
        </Button>
      </div>
    </header>
  )
}
