import { db } from "@/lib/clients/db"
import type { Prisma } from "@/lib/generated/prisma/client"

export const tokenRepo = {
  async findByToken(token: string) {
    return db.passwordResetToken.findUnique({
      where: { token },
    })
  },

  async create(data: Prisma.PasswordResetTokenCreateInput) {
    return db.passwordResetToken.create({
      data,
    })
  },

  async markAsUsed(token: string) {
    return db.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    })
  },

  async executeResetTransaction(
    userId: string,
    newPasswordHash: string,
    token: string,
  ) {
    return db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      }),
      db.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ])
  },
}
