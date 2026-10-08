import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const auth = vi.hoisted(() => ({ authenticated: false }))
vi.mock("@/lib/supabase/config", () => ({
  getSupabaseConfig: () => ({
    url: "https://example.supabase.co",
    publishableKey: "test",
  }),
}))
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: { name: string; value: string; options: object }[],
          headers: Record<string, string>
        ) => void
      }
    }
  ) => ({
    auth: {
      getClaims: async () => {
        options.cookies.setAll(
          [
            {
              name: "session",
              value: "refreshed",
              options: { httpOnly: true, path: "/" },
            },
          ],
          { "Cache-Control": "private, no-store" }
        )
        options.cookies.setAll(
          [{ name: "second", value: "cookie", options: { path: "/" } }],
          {}
        )
        return { data: auth.authenticated ? { claims: { sub: "user" } } : null }
      },
    },
  }),
}))

import { updateSession } from "@/lib/supabase/proxy"

describe("session proxy", () => {
  beforeEach(() => {
    auth.authenticated = false
  })

  it("preserves refreshed cookies and cache headers across redirect and repeated writes", async () => {
    const response = await updateSession(
      new NextRequest("http://localhost:3000/usuarios?page=2")
    )
    expect(response.headers.get("location")).toBe("http://localhost:3000/login")
    expect(response.cookies.get("session")?.value).toBe("refreshed")
    expect(response.cookies.get("second")?.value).toBe("cookie")
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
  })

  it("lets the login page verify live auth instead of redirecting based on stale claims", async () => {
    auth.authenticated = true
    const response = await updateSession(
      new NextRequest("http://localhost:3000/login")
    )
    expect(response.headers.get("location")).toBeNull()
    expect(response.cookies.get("session")?.value).toBe("refreshed")
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "second=cookie"
    )
  })

  it("serves the public home without needing Supabase", async () => {
    const response = await updateSession(
      new NextRequest("http://localhost:3000/")
    )
    expect(response.headers.get("location")).toBeNull()
    expect(response.cookies.getAll()).toHaveLength(0)
  })
})
