import { db } from "@/lib/clients/db"
import type {
  DealStage,
  DealStatus,
  Prisma,
} from "@/lib/generated/prisma/client"

export type DealWithUser = {
  id: string
  companyName: string
  value: number
  status: DealStatus
  stage: DealStage
  probability: number
  closedAt: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  businessId: string
  user: { name: string | null; email: string }
}

class DealRepo {
  async findByBusinessId(businessId: string): Promise<DealWithUser[]> {
    return db.deal.findMany({
      where: { businessId },
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async findRecentByBusinessId(
    businessId: string,
    limit = 5,
  ): Promise<DealWithUser[]> {
    return db.deal.findMany({
      where: { businessId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async findById(id: string): Promise<DealWithUser | null> {
    return db.deal.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async create(data: Prisma.DealCreateInput): Promise<DealWithUser> {
    return db.deal.create({
      data,
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async update(
    id: string,
    data: Prisma.DealUpdateInput,
  ): Promise<DealWithUser> {
    return db.deal.update({
      where: { id },
      data,
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async delete(id: string): Promise<void> {
    await db.deal.delete({ where: { id } })
  }
}

export const dealRepo = new DealRepo()
