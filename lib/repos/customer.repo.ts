import { db } from "@/lib/clients/db"
import type { CustomerTier, Prisma } from "@/lib/generated/prisma/client"

export type CustomerWithStats = {
  id: string
  name: string
  industry: string
  tier: CustomerTier
  location: string | null
  website: string | null
  contact: string
  email: string
  phone: string | null
  healthScore: number
  notes: string | null
  businessId: string
  createdAt: Date
  updatedAt: Date
  _count: { deals: number }
  deals: { value: number; status: string }[]
}

class CustomerRepo {
  async findByBusinessId(businessId: string): Promise<CustomerWithStats[]> {
    return db.customer.findMany({
      where: { businessId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { deals: true } },
        deals: { select: { value: true, status: true } },
      },
    })
  }

  async findById(id: string): Promise<CustomerWithStats | null> {
    return db.customer.findUnique({
      where: { id },
      include: {
        _count: { select: { deals: true } },
        deals: { select: { value: true, status: true } },
      },
    })
  }

  async create(data: Prisma.CustomerCreateInput): Promise<CustomerWithStats> {
    return db.customer.create({
      data,
      include: {
        _count: { select: { deals: true } },
        deals: { select: { value: true, status: true } },
      },
    })
  }

  async update(
    id: string,
    data: Prisma.CustomerUpdateInput,
  ): Promise<CustomerWithStats> {
    return db.customer.update({
      where: { id },
      data,
      include: {
        _count: { select: { deals: true } },
        deals: { select: { value: true, status: true } },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await db.customer.delete({ where: { id } })
  }
}

export const customerRepo = new CustomerRepo()
