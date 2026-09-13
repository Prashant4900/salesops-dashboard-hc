import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth/session"
import type { Role } from "@/lib/generated/prisma/enums"
import { userRepo } from "@/lib/repos/user.repo"
import {
  removeTeamMember,
  TeamError,
  updateTeamMember,
} from "@/lib/services/team.service"

const updateMemberSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "STAFF"]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const currentUser = await userRepo.findById(session.userId)
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  try {
    const json = await req.json()
    const data = updateMemberSchema.parse(json)

    const updatedMember = await updateTeamMember(
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        businessId: currentUser.businessId,
      },
      id,
      data.role as Role,
    )

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      )
    }
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const currentUser = await userRepo.findById(session.userId)
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  try {
    await removeTeamMember(
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        businessId: currentUser.businessId,
      },
      id,
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 },
    )
  }
}
