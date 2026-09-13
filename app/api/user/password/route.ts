import { NextResponse } from "next/server"
import { changePasswordSchema } from "@/lib/auth/schemas"
import { getSession } from "@/lib/auth/session"
import { AuthError, changePassword } from "@/lib/services/auth.service"

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 },
    )

  try {
    await changePassword(session.userId, parsed.data)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AuthError)
      return NextResponse.json({ error: err.message }, { status: 400 })
    throw err
  }
}
