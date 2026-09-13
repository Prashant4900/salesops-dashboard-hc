import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/shell"
import { userRepo } from "@/lib/repos/user.repo"
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    default: "SalesOps Dashboard",
    template: "%s | SalesOps Dashboard",
  },
  description: "Sales operations performance workspace.",
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isInitialized = await userRepo.hasOwner()
  if (!isInitialized) {
    redirect("/auth/onboarding")
  }

  return <DashboardShell>{children}</DashboardShell>
}
