import "server-only"

import type { AuthUser } from "@/lib/clients/api"
import type { CustomerTier } from "@/lib/generated/prisma/client"
import { customerRepo } from "@/lib/repos/customer.repo"

export class CustomerError extends Error {}

export type CreateCustomerInput = {
  name: string
  industry: string
  tier?: CustomerTier
  location?: string
  website?: string
  contact: string
  email: string
  phone?: string
  healthScore?: number
  notes?: string
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>

function formatCustomer(
  customer: Awaited<ReturnType<typeof customerRepo.findById>>,
) {
  if (!customer) return null
  const totalRevenue = customer.deals.reduce((acc, d) => acc + d.value, 0)
  const activeDeals = customer.deals.filter(
    (d) => d.status === "PENDING",
  ).length

  const now = new Date()
  const updatedTime = new Date(customer.updatedAt).getTime()
  const diffMs = now.getTime() - updatedTime
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let lastContact: string
  if (diffDays === 0) lastContact = "Today"
  else if (diffDays === 1) lastContact = "Yesterday"
  else if (diffDays < 7) lastContact = `${diffDays} days ago`
  else if (diffDays < 14) lastContact = "1 week ago"
  else lastContact = `${Math.floor(diffDays / 7)} weeks ago`

  return {
    id: customer.id,
    name: customer.name,
    industry: customer.industry,
    tier: customer.tier.charAt(0) + customer.tier.slice(1).toLowerCase() as "Enterprise" | "Growth" | "Starter",
    location: customer.location,
    website: customer.website,
    contact: customer.contact,
    email: customer.email,
    phone: customer.phone,
    healthScore: customer.healthScore,
    notes: customer.notes,
    totalRevenue,
    activeDeals,
    dealCount: customer._count.deals,
    lastContact,
    businessId: customer.businessId,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }
}

export async function getCustomers(businessId: string) {
  const customers = await customerRepo.findByBusinessId(businessId)
  return customers.map(formatCustomer)
}

export async function createCustomer(
  currentUser: AuthUser,
  input: CreateCustomerInput,
) {
  if (!currentUser.businessId) {
    throw new CustomerError("No business associated")
  }
  if (currentUser.role === "STAFF") {
    throw new CustomerError("Unauthorized to create customers")
  }

  const customer = await customerRepo.create({
    name: input.name,
    industry: input.industry,
    tier: input.tier ?? "STARTER",
    location: input.location,
    website: input.website,
    contact: input.contact,
    email: input.email,
    phone: input.phone,
    healthScore: input.healthScore ?? 50,
    notes: input.notes,
    business: { connect: { id: currentUser.businessId } },
  })

  return formatCustomer(customer)
}

export async function updateCustomer(
  currentUser: AuthUser,
  customerId: string,
  input: UpdateCustomerInput,
) {
  if (!currentUser.businessId) throw new CustomerError("No business associated")

  const customer = await customerRepo.findById(customerId)
  if (!customer || customer.businessId !== currentUser.businessId) {
    throw new CustomerError("Customer not found")
  }
  if (currentUser.role === "STAFF") {
    throw new CustomerError("Unauthorized to update customers")
  }

  const updated = await customerRepo.update(customerId, {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.industry !== undefined && { industry: input.industry }),
    ...(input.tier !== undefined && { tier: input.tier }),
    ...(input.location !== undefined && { location: input.location }),
    ...(input.website !== undefined && { website: input.website }),
    ...(input.contact !== undefined && { contact: input.contact }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.healthScore !== undefined && { healthScore: input.healthScore }),
    ...(input.notes !== undefined && { notes: input.notes }),
  })

  return formatCustomer(updated)
}

export async function deleteCustomer(
  currentUser: AuthUser,
  customerId: string,
) {
  if (!currentUser.businessId) throw new CustomerError("No business associated")
  if (currentUser.role === "STAFF") {
    throw new CustomerError("Unauthorized to delete customers")
  }

  const customer = await customerRepo.findById(customerId)
  if (!customer || customer.businessId !== currentUser.businessId) {
    throw new CustomerError("Customer not found")
  }

  await customerRepo.delete(customerId)
  return { ok: true }
}
