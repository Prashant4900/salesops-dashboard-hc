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

export type TeamPerformanceMember = {
  id: string
  name: string
  role: string
  email: string
  avatar: string
  deals: number
  revenue: number
  quota: number
  change: number
  rank: number
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

  getPerformance: (): Promise<{ performance: TeamPerformanceMember[] }> =>
    request("/api/team/performance", "GET"),
}

// ── Deals endpoints ────────────────────────────────────────────────────────

export type DealStatus = "won" | "pending" | "lost"

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost"

export type Deal = {
  id: string
  companyName: string
  value: number
  status: DealStatus
  stage: DealStage
  probability: number
  daysInStage: number
  closedAt: string | null
  createdAt: string
  updatedAt: string
  userId: string
  businessId: string
  rep: string
  repAvatar: string
}

export type RecentDeal = {
  id: string
  company: string
  value: number
  status: string
  updatedAt: string
  rep: string
  repAvatar: string
}

export type CreateDealInput = {
  companyName: string
  value: number
  status?: "WON" | "PENDING" | "LOST"
  stage?:
    | "LEAD"
    | "QUALIFIED"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "CLOSED_WON"
    | "CLOSED_LOST"
  probability?: number
  assignedUserId: string
  closedAt?: string | null
}

export type UpdateDealInput = Partial<CreateDealInput>

export const dealsApi = {
  getAll: (): Promise<{ deals: Deal[] }> => request("/api/deals", "GET"),

  getRecent: (): Promise<{ deals: RecentDeal[] }> =>
    request("/api/deals/recent", "GET"),

  create: (input: CreateDealInput): Promise<{ deal: Deal }> =>
    post("/api/deals", input),

  update: (id: string, input: UpdateDealInput): Promise<{ deal: Deal }> =>
    patch(`/api/deals/${id}`, input),

  delete: (id: string): Promise<{ ok: boolean }> =>
    request(`/api/deals/${id}`, "DELETE"),
}
