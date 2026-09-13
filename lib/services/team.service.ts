import "server-only"

import bcrypt from "bcryptjs"
import type { AddTeamMemberInput, AuthUser } from "@/lib/clients/api"
import type { Role } from "@/lib/generated/prisma/enums"
import { dealRepo } from "@/lib/repos/deal.repo"
import { userRepo } from "@/lib/repos/user.repo"

export class TeamError extends Error {}

const HASH_ROUNDS = 12

export async function getTeamMembers(businessId: string) {
  return userRepo.findByBusinessId(businessId)
}

export async function getTeamPerformance(businessId: string) {
  const users = await userRepo.findByBusinessId(businessId)
  const deals = await dealRepo.findByBusinessId(businessId)

  const statsMap = new Map<string, { revenue: number; deals: number }>()
  for (const user of users) {
    statsMap.set(user.id, { revenue: 0, deals: 0 })
  }

  for (const deal of deals) {
    if (deal.status === "WON") {
      const stats = statsMap.get(deal.userId)
      if (stats) {
        stats.revenue += deal.value
        stats.deals += 1
      }
    }
  }

  const performance = users.map((user) => {
    const stats = statsMap.get(user.id) ?? { revenue: 0, deals: 0 }
    return {
      id: user.id,
      name: user.name || "No name",
      role: user.role,
      email: user.email,
      avatar: user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : user.email.substring(0, 2).toUpperCase(),
      deals: stats.deals,
      revenue: stats.revenue,
      quota: user.quota || 0,
      change: user.performanceChange || 0,
    }
  })

  // Sort by revenue descending for rank
  performance.sort((a, b) => b.revenue - a.revenue)

  return performance.map((p, index) => ({
    ...p,
    rank: index + 1,
  }))
}

export async function addTeamMember(
  currentUser: AuthUser,
  input: AddTeamMemberInput,
) {
  if (!currentUser.businessId) {
    throw new TeamError("No business associated")
  }

  if (currentUser.role === "STAFF") {
    throw new TeamError("Unauthorized to add team members")
  }

  if (
    currentUser.role === "ADMIN" &&
    (input.role === "OWNER" || input.role === "ADMIN")
  ) {
    throw new TeamError("Admins can only create STAFF members")
  }

  if (input.role === "OWNER") {
    throw new TeamError("There can only be one owner per business")
  }

  const existingUser = await userRepo.findByEmail(input.email)
  if (existingUser) {
    throw new TeamError("Email already exists")
  }

  const passwordHash = await bcrypt.hash(
    input.password || "password123",
    HASH_ROUNDS,
  )

  const newMember = await userRepo.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: passwordHash,
    role: input.role as Role,
    business: { connect: { id: currentUser.businessId } },
  })

  return {
    id: newMember.id,
    name: newMember.name,
    email: newMember.email,
    role: newMember.role,
  }
}

export async function updateTeamMember(
  currentUser: AuthUser,
  targetUserId: string,
  newRole: Role,
) {
  if (!currentUser.businessId) throw new TeamError("No business associated")

  const targetUser = await userRepo.findById(targetUserId)
  if (!targetUser || targetUser.businessId !== currentUser.businessId) {
    throw new TeamError("User not found in this business")
  }

  if (currentUser.role === "STAFF") {
    throw new TeamError("Unauthorized")
  }

  if (newRole === "OWNER") {
    throw new TeamError("Cannot change role to OWNER")
  }

  if (currentUser.role === "ADMIN" && targetUser.role !== "STAFF") {
    throw new TeamError("Admins can only manage STAFF members")
  }

  if (currentUser.role === "ADMIN" && newRole !== "STAFF") {
    throw new TeamError("Admins cannot promote to ADMIN")
  }

  if (targetUser.role === "OWNER") {
    throw new TeamError("Cannot modify the OWNER")
  }

  const updated = await userRepo.update(targetUserId, { role: newRole })

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  }
}

export async function removeTeamMember(
  currentUser: AuthUser,
  targetUserId: string,
) {
  if (!currentUser.businessId) throw new TeamError("No business associated")

  const targetUser = await userRepo.findById(targetUserId)
  if (!targetUser || targetUser.businessId !== currentUser.businessId) {
    throw new TeamError("User not found in this business")
  }

  if (currentUser.role === "STAFF") {
    throw new TeamError("Unauthorized")
  }

  if (currentUser.role === "ADMIN" && targetUser.role !== "STAFF") {
    throw new TeamError("Admins can only remove STAFF members")
  }

  if (targetUser.role === "OWNER") {
    throw new TeamError("Cannot remove the OWNER")
  }

  await userRepo.delete(targetUserId)

  return { ok: true }
}
