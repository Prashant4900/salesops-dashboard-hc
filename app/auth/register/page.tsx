import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/auth-flow"

export default function RegisterPage() {
  return <AuthShell eyebrow="Get started"><RegisterForm /></AuthShell>
}
