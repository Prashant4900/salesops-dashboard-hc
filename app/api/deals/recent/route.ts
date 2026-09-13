import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { dealRepo } from "@/lib/repos/deal.repo"
import { userRepo } from "@/lib/repos/user.repo"

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
    const deals = await dealRepo.findRecentByBusinessId(
      currentUser.businessId,
      5,
    )

    // Map to the format expected by the frontend
    const formattedDeals = deals.map((deal) => ({
      id: deal.id,
      company: deal.companyName,
      value: deal.value,
      status: deal.status.toLowerCase(),
      updatedAt: deal.updatedAt.toISOString(),
      rep: deal.user.name || deal.user.email,
      repAvatar: deal.user.name
        ? deal.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : deal.user.email.substring(0, 2).toUpperCase(),
    }))

    return NextResponse.json({ deals: formattedDeals })
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 },
    )
  }
}
