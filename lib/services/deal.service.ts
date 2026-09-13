import "server-only"

import type { AuthUser } from "@/lib/clients/api"
import type { DealStage, DealStatus } from "@/lib/generated/prisma/client"
import { dealRepo } from "@/lib/repos/deal.repo"
import { userRepo } from "@/lib/repos/user.repo"

export class DealError extends Error {}

const DEFAULT_STAGE_PROBABILITY: Record<DealStage, number> = {
  LEAD: 20,
  QUALIFIED: 40,
  PROPOSAL: 60,
  NEGOTIATION: 80,
  CLOSED_WON: 100,
  CLOSED_LOST: 0,
}

export type CreateDealInput = {
  companyName: string
  value: number
  status?: DealStatus
  stage?: DealStage
  probability?: number
  assignedUserId: string
  closedAt?: string | null
}

export type UpdateDealInput = Partial<CreateDealInput>

function formatDeal(deal: Awaited<ReturnType<typeof dealRepo.findById>>) {
  if (!deal) return null
  const rep = deal.user.name || deal.user.email
  const repAvatar = deal.user.name
    ? deal.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : deal.user.email.substring(0, 2).toUpperCase()

  const now = new Date()
  const updatedTime = new Date(deal.updatedAt).getTime()
  const daysInStage = Math.max(
    1,
    Math.round((now.getTime() - updatedTime) / (1000 * 60 * 60 * 24)),
  )

  return {
    id: deal.id,
    companyName: deal.companyName,
    value: deal.value,
    status: deal.status.toLowerCase() as "won" | "pending" | "lost",
    stage: deal.stage.toLowerCase() as
      | "lead"
      | "qualified"
      | "proposal"
      | "negotiation"
      | "closed_won"
      | "closed_lost",
    probability: deal.probability,
    daysInStage,
    closedAt: deal.closedAt?.toISOString() ?? null,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    userId: deal.userId,
    businessId: deal.businessId,
    rep,
    repAvatar,
  }
}

export async function getDeals(businessId: string) {
  const deals = await dealRepo.findByBusinessId(businessId)
  return deals.map(formatDeal)
}

export async function createDeal(
  currentUser: AuthUser,
  input: CreateDealInput,
) {
  if (!currentUser.businessId) {
    throw new DealError("No business associated")
  }
  if (currentUser.role === "STAFF") {
    throw new DealError("Unauthorized to create deals")
  }

  // Validate assigned user belongs to same business
  const assignee = await userRepo.findById(input.assignedUserId)
  if (!assignee || assignee.businessId !== currentUser.businessId) {
    throw new DealError("Assigned user not found in this business")
  }

  let stage: DealStage = input.stage ?? "LEAD"
  let status: DealStatus = input.status ?? "PENDING"

  if (input.stage) {
    if (input.stage === "CLOSED_WON") status = "WON"
    else if (input.stage === "CLOSED_LOST") status = "LOST"
    else status = "PENDING"
  } else if (input.status) {
    if (input.status === "WON") stage = "CLOSED_WON"
    else if (input.status === "LOST") stage = "CLOSED_LOST"
    else stage = "LEAD"
  }

  const probability =
    input.probability ?? DEFAULT_STAGE_PROBABILITY[stage] ?? 20

  const deal = await dealRepo.create({
    companyName: input.companyName,
    value: input.value,
    status,
    stage,
    probability,
    closedAt:
      status !== "PENDING"
        ? input.closedAt
          ? new Date(input.closedAt)
          : new Date()
        : input.closedAt
          ? new Date(input.closedAt)
          : null,
    user: { connect: { id: input.assignedUserId } },
    business: { connect: { id: currentUser.businessId } },
  })

  return formatDeal(deal)
}

export async function updateDeal(
  currentUser: AuthUser,
  dealId: string,
  input: UpdateDealInput,
) {
  if (!currentUser.businessId) throw new DealError("No business associated")

  const deal = await dealRepo.findById(dealId)
  if (!deal || deal.businessId !== currentUser.businessId) {
    throw new DealError("Deal not found")
  }
  if (currentUser.role === "STAFF") {
    throw new DealError("Unauthorized to update deals")
  }

  const updateData: Parameters<typeof dealRepo.update>[1] = {}
  if (input.companyName !== undefined) {
    updateData.companyName = input.companyName
  }
  if (input.value !== undefined) {
    updateData.value = input.value
  }

  // Handle stage change & status synchronization
  if (input.stage !== undefined) {
    updateData.stage = input.stage
    if (input.probability !== undefined) {
      updateData.probability = input.probability
    } else {
      updateData.probability = DEFAULT_STAGE_PROBABILITY[input.stage]
    }

    if (input.stage === "CLOSED_WON") {
      updateData.status = "WON"
      updateData.closedAt = input.closedAt
        ? new Date(input.closedAt)
        : new Date()
    } else if (input.stage === "CLOSED_LOST") {
      updateData.status = "LOST"
      updateData.closedAt = input.closedAt
        ? new Date(input.closedAt)
        : new Date()
    } else {
      updateData.status = "PENDING"
      updateData.closedAt = null
    }
  } else if (input.status !== undefined) {
    updateData.status = input.status
    if (input.status === "WON") {
      updateData.stage = "CLOSED_WON"
      updateData.probability = 100
      updateData.closedAt = input.closedAt
        ? new Date(input.closedAt)
        : new Date()
    } else if (input.status === "LOST") {
      updateData.stage = "CLOSED_LOST"
      updateData.probability = 0
      updateData.closedAt = input.closedAt
        ? new Date(input.closedAt)
        : new Date()
    } else if (deal.stage === "CLOSED_WON" || deal.stage === "CLOSED_LOST") {
      updateData.stage = "LEAD"
      updateData.probability = 20
      updateData.closedAt = null
    }
  }

  if (input.probability !== undefined && input.stage === undefined) {
    updateData.probability = input.probability
  }

  if (input.closedAt !== undefined && updateData.closedAt === undefined) {
    updateData.closedAt = input.closedAt ? new Date(input.closedAt) : null
  }

  if (input.assignedUserId !== undefined) {
    const assignee = await userRepo.findById(input.assignedUserId)
    if (!assignee || assignee.businessId !== currentUser.businessId) {
      throw new DealError("Assigned user not found in this business")
    }
    updateData.user = { connect: { id: input.assignedUserId } }
  }

  const updated = await dealRepo.update(dealId, updateData)
  return formatDeal(updated)
}

export async function deleteDeal(currentUser: AuthUser, dealId: string) {
  if (!currentUser.businessId) throw new DealError("No business associated")
  if (currentUser.role === "STAFF") {
    throw new DealError("Unauthorized to delete deals")
  }

  const deal = await dealRepo.findById(dealId)
  if (!deal || deal.businessId !== currentUser.businessId) {
    throw new DealError("Deal not found")
  }

  await dealRepo.delete(dealId)
  return { ok: true }
}
