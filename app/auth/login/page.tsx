import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/auth-flow"

export default function LoginPage() {
  return <AuthShell eyebrow="Welcome back"><LoginForm /></AuthShell>
}
