import { db } from "@/lib/clients/db"
import type { Prisma } from "@/lib/generated/prisma/client"

export const businessRepo = {
  async create(data: Prisma.BusinessCreateInput) {
    return db.business.create({
      data,
    })
  },

  async findById(id: string) {
    return db.business.findUnique({
      where: { id },
    })
  },

  async createOwnerAndBusiness(data: {
    user: Omit<Prisma.UserCreateInput, "role">
    business: Omit<Prisma.BusinessCreateInput, "slug"> & { slug: string }
  }) {
    return db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: data.business,
      })
      const user = await tx.user.create({
        data: {
          ...data.user,
          role: "OWNER",
          business: { connect: { id: business.id } },
        },
      })
      return { user, business }
    })
  },
}
