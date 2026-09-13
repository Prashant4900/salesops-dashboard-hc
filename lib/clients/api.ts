/**
 * Browser-side HTTP client for communicating with the Next.js API routes.
 * This is the only place raw `fetch` calls and URL strings should live.
 * Hooks import from here; they never hardcode URLs themselves.
 */

import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  OnboardingInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@/lib/auth/schemas"

export type AuthUser = {
  id: string
  name: string | null
  email: string
  role: string
  businessId: string | null
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

async function request<T>(
  url: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error((data as { error?: string }).error ?? "Request failed.")
  return data as T
}

const post = <T>(url: string, body?: unknown) => request<T>(url, "POST", body)
const patch = <T>(url: string, body: unknown) => request<T>(url, "PATCH", body)

// ── Auth endpoints ─────────────────────────────────────────────────────────

export const authApi = {
  getSession: (): Promise<{ user: AuthUser }> =>
    request("/api/auth/session", "GET"),

  login: (input: LoginInput): Promise<{ user: AuthUser }> =>
    post("/api/auth/login", input),

  register: (input: RegisterInput): Promise<{ user: AuthUser }> =>
    post("/api/auth/register", input),

  onboarding: (input: OnboardingInput): Promise<{ user: AuthUser }> =>
    post("/api/auth/onboarding", input),

  logout: (): Promise<{ ok: boolean }> => post("/api/auth/session"),

  forgotPassword: (input: ForgotPasswordInput): Promise<{ sent: boolean }> =>
    post("/api/auth/forgot-password", input),

  resetPassword: (input: ResetPasswordInput): Promise<{ ok: boolean }> =>
    post("/api/auth/reset-password", input),
}

// ── User endpoints ─────────────────────────────────────────────────────────

export const userApi = {
  updateProfile: (input: UpdateProfileInput): Promise<{ user: AuthUser }> =>
    patch("/api/user/profile", input),

  changePassword: (input: ChangePasswordInput): Promise<{ ok: boolean }> =>
    patch("/api/user/password", input),
}

// ── Team endpoints ─────────────────────────────────────────────────────────

export type TeamMember = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt?: string
}

export type AddTeamMemberInput = {
  name: string
  email: string
  password?: string
  role: string
}

export const teamApi = {
  getMembers: (): Promise<{ members: TeamMember[] }> =>
    request("/api/team", "GET"),

  addMember: (input: AddTeamMemberInput): Promise<{ member: TeamMember }> =>
    post("/api/team", input),

  updateMember: (id: string, role: string): Promise<{ member: TeamMember }> =>
    patch(`/api/team/${id}`, { role }),

  removeMember: (id: string): Promise<{ ok: boolean }> =>
    request(`/api/team/${id}`, "DELETE"),
}
