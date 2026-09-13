import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"
import {
  addTeamMember,
  getTeamMembers,
  TeamError,
} from "@/lib/services/team.service"

const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.enum(["OWNER", "ADMIN", "STAFF"]),
})

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const currentUser = await userRepo.findById(session.userId)
  if (!currentUser?.businessId) {
    return NextResponse.json(
      { error: "No business associated" },
      { status: 400 },
    )
  }

  const members = await getTeamMembers(currentUser.businessId)
  return NextResponse.json({ members })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const currentUser = await userRepo.findById(session.userId)
  if (!currentUser?.businessId) {
    return NextResponse.json(
      { error: "No business associated" },
      { status: 400 },
    )
  }

  try {
    const json = await req.json()
    const data = createMemberSchema.parse(json)

    const newMember = await addTeamMember(
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        businessId: currentUser.businessId,
      },
      data,
    )

    return NextResponse.json({ member: newMember }, { status: 201 })
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
      { error: "Failed to create member" },
      { status: 500 },
    )
  }
}
