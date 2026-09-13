import "server-only"

import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"
import { addHours } from "date-fns"
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  OnboardingInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/lib/auth/schemas"
import type { Role } from "@/lib/generated/prisma/enums"
import { userRepo } from "@/lib/repos/user.repo"
import { tokenRepo } from "@/lib/repos/token.repo"
import { businessRepo } from "@/lib/repos/business.repo"

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

export async function onboardOwner(input: OnboardingInput) {
  const hasOwner = await userRepo.hasOwner()
  if (hasOwner) {
    throw new AuthError("System is already initialized.")
  }

  const existing = await userRepo.findByEmail(input.email)
  if (existing) {
    throw new AuthError("An account with this email already exists.")
  }

  const passwordHash = await bcrypt.hash(input.password, HASH_ROUNDS)

  const slug = input.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  const { user } = await businessRepo.createOwnerAndBusiness({
    user: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: passwordHash,
    },
    business: {
      name: input.company,
      slug,
      website: input.website || null,
      industry: input.industry,
      size: input.size,
    },
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
  if (!user) return { sent: true }

  const token = randomBytes(32).toString("hex")
  await tokenRepo.create({
    token,
    user: { connect: { id: user.id } },
    expiresAt: addHours(new Date(), 1),
  })
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

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const existing = await userRepo.findByEmail(input.email)
  if (existing && existing.id !== userId) {
    throw new AuthError("This email is already in use by another account.")
  }

  const user = await userRepo.update(userId, {
    name: input.name,
    email: input.email.toLowerCase(),
  })
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await userRepo.findById(userId)
  if (!user) throw new AuthError("User not found.")

  const valid = await bcrypt.compare(input.currentPassword, user.password)
  if (!valid) throw new AuthError("Current password is incorrect.")

  const passwordHash = await bcrypt.hash(input.newPassword, HASH_ROUNDS)
  await userRepo.update(userId, { password: passwordHash })
  return { ok: true }
}
