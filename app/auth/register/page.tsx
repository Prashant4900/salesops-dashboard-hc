import { RegisterForm } from "@/components/auth/auth-flow"
import { AuthShell } from "@/components/auth/auth-shell"

export const dynamic = "force-dynamic"

export default function RegisterPage() {
  return (
    <AuthShell eyebrow="Get started">
      <RegisterForm />
    </AuthShell>
  )
}
