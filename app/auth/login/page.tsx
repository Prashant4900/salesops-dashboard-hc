import { LoginForm } from "@/components/auth/auth-flow"
import { AuthShell } from "@/components/auth/auth-shell"
import { userRepo } from "@/lib/repos/user.repo"
import { redirect } from "next/navigation"

// LoginForm reads ?next= via useSearchParams, so it must render dynamically.
export const dynamic = "force-dynamic"

export default async function LoginPage() {
  if (!(await userRepo.hasOwner())) {
    redirect("/auth/onboarding")
  }

  return (
    <AuthShell eyebrow="Welcome back">
      <LoginForm />
    </AuthShell>
  )
}
