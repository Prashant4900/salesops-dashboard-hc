import { AuthShell } from "@/components/auth/auth-shell"
import { OnboardingForm } from "@/components/auth/auth-flow"

export default function OnboardingPage() {
  return <AuthShell eyebrow="Workspace setup"><OnboardingForm /></AuthShell>
}
