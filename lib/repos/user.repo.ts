import { db } from "@/lib/clients/db"
import { Prisma } from "@/lib/generated/prisma/client"

export const userRepo = {
  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
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
}
