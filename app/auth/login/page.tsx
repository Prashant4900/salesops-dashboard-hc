import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/auth-flow"

// LoginForm reads ?next= via useSearchParams, so it must render dynamically.
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return <AuthShell eyebrow="Welcome back"><LoginForm /></AuthShell>
}
