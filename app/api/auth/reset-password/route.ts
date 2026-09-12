import { NextResponse } from "next/server"

import { resetPasswordSchema } from "@/lib/auth/schemas"
import { AuthError, resetPassword } from "@/lib/services/auth.service"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })

  try {
    await resetPassword(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof AuthError)
      return NextResponse.json({ error: error.message }, { status: 400 })
    throw error
  }
}
