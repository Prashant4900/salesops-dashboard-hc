"use client"

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useForgotPassword,
  useLogin,
  useRegister,
  useResetPassword,
} from "@/hooks/use-auth"

const inputClass =
  "h-12 border-border bg-card/60 px-4 text-sm placeholder:text-muted-foreground/60"

function Header({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Enter your password",
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const login = useLogin()
  const _router = useRouter()
  const searchParams = useSearchParams()
  const error = login.error instanceof Error ? login.error.message : ""
  return (
    <div className="w-full max-w-107.5 space-y-8">
      <Header
        title="Welcome back"
        description="Sign in with your work email to continue to your SalesOps workspace."
      />
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          login.mutate({ email, password })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="login-email">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[oklch(0.7_0.18_145)]"
          />
          Remember me
        </label>
        <Button
          disabled={login.isPending}
          className="h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {login.isPending ? (
            "Signing in..."
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {(error || searchParams.get("next")) && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {!error && searchParams.get("next") && (
          <p className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
            Please sign in to continue.
          </p>
        )}
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New to SalesOps?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-foreground hover:text-accent"
        >
          Create an account
        </Link>
      </p>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-accent" /> Email-only, secure
        access
      </div>
    </div>
  )
}

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const register = useRegister()
  const error = register.error instanceof Error ? register.error.message : ""
  return (
    <div className="w-full max-w-107.5 space-y-8">
      <Header
        title="Create your account"
        description="Start with your email and set up your personal access details."
      />
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (name && email && password.length >= 8)
            register.mutate({ name, email, password })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="register-name">Full name</Label>
          <Input
            id="register-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Work email</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Create password</Label>
          <PasswordInput
            id="register-password"
            value={password}
            onChange={setPassword}
          />
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters with a mix of letters and numbers.
          </p>
        </div>
        <Button
          disabled={register.isPending || password.length < 8}
          className="h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {register.isPending ? (
            "Creating account..."
          ) : (
            <>
              Continue to workspace setup <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:text-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const forgot = useForgotPassword()
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) forgot.mutate({ email }, { onSuccess: () => setSent(true) })
  }
  if (sent)
    return (
      <div className="w-full max-w-107.5 space-y-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Mail className="h-5 w-5" />
        </div>
        <Header
          title="Check your inbox"
          description={`If an account exists for ${email}, we've sent a password reset link.`}
        />
        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={() => setSent(false)}
        >
          Use a different email
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-semibold text-foreground">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  return (
    <div className="w-full max-w-107.5 space-y-8">
      <Header
        title="Reset your password"
        description="Enter your work email and we'll send you a secure link to choose a new password."
      />
      <form className="space-y-5" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Work email</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>
        <Button
          disabled={forgot.isPending}
          className="h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {forgot.isPending ? (
            "Sending..."
          ) : (
            <>
              Send reset link <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:text-accent"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [done, setDone] = useState(false)
  const reset = useResetPassword()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const error = reset.error instanceof Error ? reset.error.message : ""
  if (done)
    return (
      <div className="w-full max-w-107.5 space-y-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Check className="h-5 w-5" />
        </div>
        <Header
          title="Password updated"
          description="Your password has been changed successfully. You can now sign in with your new password."
        />
        <Link
          href="/auth/login"
          className="flex h-12 items-center justify-center rounded-md bg-accent font-medium text-accent-foreground"
        >
          Continue to sign in
        </Link>
      </div>
    )
  const valid = password.length >= 8 && password === confirm && !!token
  return (
    <div className="w-full max-w-107.5 space-y-8">
      <Header
        title="Choose a new password"
        description="Create a strong password you haven't used before."
      />
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid)
            reset.mutate(
              { token, password },
              { onSuccess: () => setDone(true) },
            )
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="reset-password">New password</Label>
          <PasswordInput
            id="reset-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirm">Confirm new password</Label>
          <PasswordInput
            id="reset-confirm"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter your password"
          />
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className={password.length >= 8 ? "text-accent" : ""}>
            • At least 8 characters
          </p>
          <p className={confirm && password === confirm ? "text-accent" : ""}>
            • Passwords match
          </p>
          {!token && (
            <p className="text-destructive">
              • Missing reset token — open the link from your email
            </p>
          )}
        </div>
        <Button
          disabled={!valid || reset.isPending}
          className="h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {reset.isPending ? (
            "Updating..."
          ) : (
            <>
              Update password <LockKeyhole className="h-4 w-4" />
            </>
          )}
        </Button>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}

export function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [complete, setComplete] = useState(false)
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    website: "",
    industry: "",
    size: "",
  })
  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))
  if (complete)
    return (
      <div className="w-full max-w-135 space-y-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Check className="h-6 w-6" />
        </div>
        <Header
          title="Your workspace is ready"
          description={`Welcome to SalesOps, ${values.name || "there"}. Your ${values.company || "company"} workspace has been set up.`}
        />
        <Link
          href="/overview"
          className="flex h-12 items-center justify-center rounded-md bg-accent font-medium text-accent-foreground"
        >
          Open dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    )
  const ownerReady = values.name && values.email && values.password.length >= 8
  return (
    <div className="w-full max-w-135 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Owner onboarding
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Step {step} of 2</p>
        </div>
        <div className="flex gap-2">
          {[1, 2].map((item) => (
            <span
              key={item}
              className={`h-1.5 w-14 rounded-full ${item <= step ? "bg-accent" : "bg-secondary"}`}
            />
          ))}
        </div>
      </div>
      {step === 1 ? (
        <>
          <Header
            title="Create your owner account"
            description="Set up your owner access before adding your business details."
          />
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="onboard-name">Your name</Label>
              <Input
                id="onboard-name"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Alex Morgan"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboard-email">Work email</Label>
              <Input
                id="onboard-email"
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@company.com"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboard-password">Create password</Label>
              <PasswordInput
                id="onboard-password"
                value={values.password}
                onChange={(value) => update("password", value)}
                placeholder="At least 8 characters"
              />
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters with a mix of letters and numbers.
              </p>
            </div>
            <Button
              disabled={!ownerReady}
              onClick={() => setStep(2)}
              className="h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue to business setup <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Header
            title="Set up your business"
            description="A few details help us shape the right workspace for your team."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="onboard-company">Company name</Label>
              <Input
                id="onboard-company"
                value={values.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc."
                className={inputClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="onboard-website">
                Company website{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="onboard-website"
                value={values.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://acme.com"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboard-industry">Industry</Label>
              <Input
                id="onboard-industry"
                value={values.industry}
                onChange={(e) => update("industry", e.target.value)}
                placeholder="SaaS"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboard-size">Company size</Label>
              <Input
                id="onboard-size"
                value={values.size}
                onChange={(e) => update("size", e.target.value)}
                placeholder="11–50 employees"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="h-12 flex-1"
            >
              Back
            </Button>
            <Button
              disabled={!values.company || !values.industry || !values.size}
              onClick={() => setComplete(true)}
              className="h-12 flex-2 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Create workspace <Check className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
