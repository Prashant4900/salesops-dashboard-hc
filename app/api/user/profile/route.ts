import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { updateProfileSchema } from "@/lib/auth/schemas"
import { AuthError, updateProfile } from "@/lib/services/auth.service"

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 },
    )

  try {
    const user = await updateProfile(session.userId, parsed.data)
    return NextResponse.json({ user })
  } catch (err) {
    if (err instanceof AuthError)
      return NextResponse.json({ error: err.message }, { status: 400 })
    throw err
  }
}
