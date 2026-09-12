import { LoginForm } from "@/components/auth/auth-flow"
import { AuthShell } from "@/components/auth/auth-shell"

// LoginForm reads ?next= via useSearchParams, so it must render dynamically.
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Welcome back">
      <LoginForm />
    </AuthShell>
  )
}
