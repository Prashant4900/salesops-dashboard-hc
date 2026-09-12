import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const SESSION_COOKIE = "salesops_session"
const SESSION_TTL = "7d"

function secret() {
  const value = process.env.AUTH_SECRET
  if (!value) throw new Error("AUTH_SECRET is not set")
  return new TextEncoder().encode(value)
}

export type SessionPayload = {
  userId: string
  role: string
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret())
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    if (typeof payload.userId !== "string" || typeof payload.role !== "string")
      return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export const AUTH_COOKIE_NAME = SESSION_COOKIE
