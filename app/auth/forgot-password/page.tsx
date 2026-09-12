import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/auth-flow"

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Account recovery"><ForgotPasswordForm /></AuthShell>
}
