import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"
import { DealError, deleteDeal, updateDeal } from "@/lib/services/deal.service"

async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const user = await userRepo.findById(session.userId)
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as string,
    businessId: user.businessId,
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const deal = await updateDeal(currentUser, id, body)
    return NextResponse.json({ deal })
  } catch (err) {
    if (err instanceof DealError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteDeal(currentUser, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof DealError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 },
    )
  }
}
