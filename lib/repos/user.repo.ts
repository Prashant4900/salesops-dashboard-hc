import { db } from "@/lib/clients/db"
import type { Prisma } from "@/lib/generated/prisma/client"

export const userRepo = {
  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
    })
  },

  async findById(id: string) {
    return db.user.findUnique({
      where: { id },
    })
  },

  async create(data: Prisma.UserCreateInput) {
    return db.user.create({
      data,
    })
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return db.user.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return db.user.delete({
      where: { id },
    })
  },

  async hasOwner() {
    // Keep the UI preview usable when the optional database integration is not configured.
    if (!process.env.DATABASE_URL) return true

    const owner = await db.user.findFirst({
      where: { role: "OWNER" },
      select: { id: true },
    })
    return !!owner
  },

  async findByBusinessId(businessId: string) {
    return db.user.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        quota: true,
        performanceChange: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })
  },
}
