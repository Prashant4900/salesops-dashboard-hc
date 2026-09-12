import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { requestPasswordReset } from "@/lib/auth/service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const result = await requestPasswordReset(parsed.data);
  // Always the same response shape so we don't leak which emails exist.
  return NextResponse.json({ sent: result.sent });
}
