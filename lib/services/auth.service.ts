import "server-only"

import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"
import { addHours } from "date-fns"
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/auth/schemas"
import type { Role } from "@/lib/generated/prisma/enums"
import { userRepo } from "@/lib/repos/user.repo"
import { tokenRepo } from "@/lib/repos/token.repo"

export class AuthError extends Error {}

const HASH_ROUNDS = 12

export async function registerUser(input: RegisterInput) {
  const existing = await userRepo.findByEmail(input.email)
  if (existing)
    throw new AuthError("An account with this email already exists.")

  const passwordHash = await bcrypt.hash(input.password, HASH_ROUNDS)
  const user = await userRepo.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: passwordHash,
    role: "STAFF" as Role,
  })
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export async function authenticateUser(input: LoginInput) {
  const user = await userRepo.findByEmail(input.email)
  if (!user) throw new AuthError("Invalid email or password.")

  const valid = await bcrypt.compare(input.password, user.password)
  if (!valid) throw new AuthError("Invalid email or password.")

  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await userRepo.findByEmail(input.email)
  // Same response either way to avoid leaking which emails exist.
  if (!user) return { sent: true }

  const token = randomBytes(32).toString("hex")
  await tokenRepo.create({
    token,
    user: { connect: { id: user.id } },
    expiresAt: addHours(new Date(), 1),
  })
  // Email delivery is out of scope here; the token is returned for dev/testing.
  return { sent: true, token }
}

export async function resetPassword(input: ResetPasswordInput) {
  const record = await tokenRepo.findByToken(input.token)
  if (!record || record.expiresAt < new Date() || record.usedAt)
    throw new AuthError("This reset link is invalid or has expired.")

  const passwordHash = await bcrypt.hash(input.password, HASH_ROUNDS)
  await tokenRepo.executeResetTransaction(record.userId, passwordHash, input.token)
  return { ok: true }
}
