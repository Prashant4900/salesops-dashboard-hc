import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"
import { getTeamPerformance } from "@/lib/services/team.service"

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

  try {
    const performance = await getTeamPerformance(currentUser.businessId)
    return NextResponse.json({ performance })
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch performance" },
      { status: 500 },
    )
  }
}
