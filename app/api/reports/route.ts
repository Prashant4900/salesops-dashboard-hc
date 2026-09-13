import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"
import { getReportsData } from "@/lib/services/reports.service"

async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const user = await userRepo.findById(session.userId)
  if (!user) return null
  return { id: user.id, businessId: user.businessId }
}

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  if (!currentUser.businessId) {
    return NextResponse.json({ error: "No business associated" }, { status: 400 })
  }

  try {
    const data = await getReportsData(currentUser.businessId)
    return NextResponse.json(data)
  } catch (err) {
    console.error("Reports error:", err)
    return NextResponse.json({ error: "Failed to compute reports" }, { status: 500 })
  }
}
