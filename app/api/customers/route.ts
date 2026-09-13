import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"
import {
  createCustomer,
  CustomerError,
  getCustomers,
} from "@/lib/services/customer.service"

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

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  if (!currentUser.businessId) {
    return NextResponse.json(
      { error: "No business associated" },
      { status: 400 },
    )
  }

  try {
    const customers = await getCustomers(currentUser.businessId)
    return NextResponse.json({ customers })
  } catch (_err) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const customer = await createCustomer(currentUser, body)
    return NextResponse.json({ customer }, { status: 201 })
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    )
  }
}
