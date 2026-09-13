import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  OnboardingInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/lib/auth/schemas"
import { authApi, userApi } from "@/lib/clients/api"
import type { AuthUser } from "@/lib/clients/api"
import { userCache } from "@/lib/store/user-cache"

export type { AuthUser }

// ── Session ────────────────────────────────────────────────────────────────

export function useSession() {
  const queryClient = useQueryClient()

  // Seed the React Query cache from localStorage AFTER hydration (client-only).
  // Using useEffect ensures server and client render identically on first paint,
  // avoiding hydration mismatches. The background API fetch still validates.
  useEffect(() => {
    const existing = queryClient.getQueryData<AuthUser | null>(["auth", "session"])
    if (existing === undefined) {
      const cached = userCache.get()
      if (cached) {
        queryClient.setQueryData(["auth", "session"], cached)
      }
    }
  }, [queryClient])

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      try {
        const data = await authApi.getSession()
        userCache.set(data.user)
        return data.user
      } catch {
        userCache.clear()
        return null
      }
    },
    staleTime: 60_000,
  })
}

// ── Auth mutations ─────────────────────────────────────────────────────────

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      userCache.set(data.user)
      queryClient.setQueryData(["auth", "session"], data.user)
      router.push("/overview")
      router.refresh()
    },
  })
}

export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (data) => {
      userCache.set(data.user)
      queryClient.setQueryData(["auth", "session"], data.user)
      router.push("/auth/onboarding")
      router.refresh()
    },
  })
}

export function useOnboarding() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: OnboardingInput) => authApi.onboarding(input),
    onSuccess: (data) => {
      userCache.set(data.user)
      queryClient.setQueryData(["auth", "session"], data.user)
      router.push("/overview")
      router.refresh()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authApi.resetPassword(input),
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Wipe local cache immediately so the next page load starts fresh.
      userCache.clear()
      queryClient.setQueryData(["auth", "session"], null)
      queryClient.removeQueries({ queryKey: ["auth"] })
      router.push("/auth/login")
      router.refresh()
    },
  })
}

// ── User mutations ─────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => userApi.updateProfile(input),
    onSuccess: (data) => {
      // Persist the updated name/email so the next page load reflects changes.
      userCache.set(data.user)
      queryClient.setQueryData(["auth", "session"], (old: AuthUser | null) =>
        old ? { ...old, name: data.user.name, email: data.user.email } : old,
      )
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => userApi.changePassword(input),
  })
}
