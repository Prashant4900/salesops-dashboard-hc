import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { userRepo } from "@/lib/repos/user.repo"
import {
  CustomerError,
  deleteCustomer,
  updateCustomer,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const customer = await updateCustomer(currentUser, id, body)
    return NextResponse.json({ customer })
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update customer" },
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

  try {
    const { id } = await params
    const result = await deleteCustomer(currentUser, id)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    )
  }
}
