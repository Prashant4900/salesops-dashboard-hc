import { NextResponse } from "next/server"

import { registerSchema } from "@/lib/auth/schemas"
import { setSessionCookie } from "@/lib/auth/session"
import { AuthError, registerUser } from "@/lib/services/auth.service"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })

  try {
    const user = await registerUser(parsed.data)
    await setSessionCookie({ userId: user.id, role: user.role })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError)
      return NextResponse.json({ error: error.message }, { status: 409 })
    throw error
  }
}
