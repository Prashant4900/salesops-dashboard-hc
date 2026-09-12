import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/auth-flow"

export default function ResetPasswordPage() {
  return <AuthShell eyebrow="Account recovery"><ResetPasswordForm /></AuthShell>
}
