import { ForgotPasswordForm } from "@/components/auth/auth-flow"
import { AuthShell } from "@/components/auth/auth-shell"

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Account recovery">
      <ForgotPasswordForm />
    </AuthShell>
  )
}
