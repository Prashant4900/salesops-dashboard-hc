"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import type { Section } from "@/lib/dashboard-config"
import { useAppStore } from "@/lib/store/use-app-store"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const activeSection = (pathname.split("/")[1] || "overview") as Section
  const { isSidebarOpen } = useAppStore()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeSection={activeSection} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
          !isSidebarOpen ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <Header activeSection={activeSection} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
