import { NextResponse } from "next/server"

import { clearSessionCookie, getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"

export async function POST() {
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  
  const user = await userRepo.findById(session.userId)
  if (!user) {
    await clearSessionCookie()
    return NextResponse.json({ error: "User not found." }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}
