import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/auth-flow"

// Reads the ?token= search param via useSearchParams, so it must render dynamically.
export const dynamic = "force-dynamic"

export default function ResetPasswordPage() {
  return <AuthShell eyebrow="Account recovery"><ResetPasswordForm /></AuthShell>
}
