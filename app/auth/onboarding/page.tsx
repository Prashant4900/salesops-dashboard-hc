import { OnboardingForm } from "@/components/auth/auth-flow"
import { AuthShell } from "@/components/auth/auth-shell"

export default function OnboardingPage() {
  return (
    <AuthShell eyebrow="Workspace setup">
      <OnboardingForm />
    </AuthShell>
  )
}
