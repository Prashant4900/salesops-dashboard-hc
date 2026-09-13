/**
 * localStorage cache for the authenticated user's public profile.
 *
 * ⚠️  We store only non-sensitive fields (id, name, email, role).
 *     The JWT session token stays in the HTTP-only cookie — never in localStorage.
 *
 * This cache is used as `initialData` for the React Query session query so the
 * UI renders instantly on page load while the real /api/auth/session round-trip
 * completes in the background.
 */

import type { AuthUser } from "@/lib/clients/api"

const KEY = "salesops:user"

function isBrowser() {
  return typeof window !== "undefined"
}

export const userCache = {
  /** Read the cached user. Returns null if nothing is stored or parse fails. */
  get(): AuthUser | null {
    if (!isBrowser()) return null
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  },

  /** Persist the user after a successful login / register / profile update. */
  set(user: AuthUser): void {
    if (!isBrowser()) return
    try {
      localStorage.setItem(KEY, JSON.stringify(user))
    } catch {
      // Storage quota exceeded or private-browsing restrictions — silently ignore.
    }
  },

  /** Clear the cache on logout or when the server returns 401. */
  clear(): void {
    if (!isBrowser()) return
    localStorage.removeItem(KEY)
  },
}
