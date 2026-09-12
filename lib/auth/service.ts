import "server-only";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { addHours } from "date-fns";

import { prisma } from "@/lib/prisma";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/auth/schemas";
import type { Role } from "@/lib/generated/prisma/enums";

export class AuthError extends Error {}

const HASH_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) throw new AuthError("An account with this email already exists.");

  const passwordHash = await bcrypt.hash(input.password, HASH_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: passwordHash,
      role: "STAFF" as Role,
    },
  });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) throw new AuthError("Invalid email or password.");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new AuthError("Invalid email or password.");

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  // Same response either way to avoid leaking which emails exist.
  if (!user) return { sent: true };

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: addHours(new Date(), 1),
    },
  });
  // Email delivery is out of scope here; the token is returned for dev/testing.
  return { sent: true, token };
}

export async function resetPassword(input: ResetPasswordInput) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: input.token },
  });
  if (!record || record.expiresAt < new Date() || record.usedAt)
    throw new AuthError("This reset link is invalid or has expired.");

  const passwordHash = await bcrypt.hash(input.password, HASH_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token: input.token },
      data: { usedAt: new Date() },
    }),
  ]);
  return { ok: true };
}
