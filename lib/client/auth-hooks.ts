import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/auth/schemas";

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed.");
  return data as T;
}

export type AuthUser = { id: string; name: string | null; email: string; role: string };

export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load session.");
      return ((await res.json()) as { user: AuthUser }).user;
    },
    staleTime: 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      postJson<{ user: AuthUser }>("/api/auth/login", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "session"], data.user);
      router.push("/overview");
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      postJson<{ user: AuthUser }>("/api/auth/register", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "session"], data.user);
      router.push("/auth/onboarding");
      router.refresh();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      postJson<{ sent: boolean }>("/api/auth/forgot-password", input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      postJson<{ ok: boolean }>("/api/auth/reset-password", input),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postJson<{ ok: boolean }>("/api/auth/session"),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.removeQueries({ queryKey: ["auth"] });
      router.push("/auth/login");
      router.refresh();
    },
  });
}
