import { db } from "@/lib/clients/db"
import { Prisma } from "@/lib/generated/prisma/client"

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

  async hasOwner() {
    // Keep the UI preview usable when the optional database integration is not configured.
    if (!process.env.DATABASE_URL) return true

    const owner = await db.user.findFirst({
      where: { role: "OWNER" },
      select: { id: true },
    })
    return !!owner
  },
}

