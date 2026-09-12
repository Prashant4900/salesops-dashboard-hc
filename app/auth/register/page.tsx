import { RegisterForm } from "@/components/auth/auth-flow"
import { AuthShell } from "@/components/auth/auth-shell"
import { userRepo } from "@/lib/repos/user.repo"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  if (!(await userRepo.hasOwner())) {
    redirect("/auth/onboarding")
  }

  return (
    <AuthShell eyebrow="Get started">
      <RegisterForm />
    </AuthShell>
  )
}
