import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const auth = vi.hoisted(() => ({ signIn: vi.fn() }))
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
      signInWithPassword: async (input: unknown) => {
        options.cookies.setAll(
          [
            {
              name: "session",
              value: "signed-in",
              options: { httpOnly: true, path: "/" },
            },
          ],
          { "Cache-Control": "private, no-store" }
        )
        return auth.signIn(input)
      },
    },
  }),
}))

import { POST } from "@/app/auth/login/route"

function request(
  origin = "http://localhost:3000",
  accept = "application/json"
) {
  const body = new FormData()
  body.set("email", "  USER@example.com  ")
  body.set("password", "example-password")
  return new NextRequest("http://localhost:3000/auth/login", {
    method: "POST",
    body,
    headers: { origin, accept },
  })
}

describe("login endpoint", () => {
  beforeEach(() => {
    auth.signIn.mockReset().mockResolvedValue({ error: null })
  })

  it("rejects cross-origin login before calling Auth", async () => {
    const response = await POST(request("https://other.example"))
    expect(response.status).toBe(403)
    expect(auth.signIn).not.toHaveBeenCalled()
  })

  it("normalizes email and returns cookies with an uncacheable JSON response", async () => {
    const response = await POST(request())
    expect(auth.signIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "example-password",
    })
    expect(await response.json()).toEqual({ ok: true })
    expect(response.cookies.get("session")?.value).toBe("signed-in")
    expect(response.headers.get("Cache-Control")).toContain("no-store")
  })

  it("supports the native form redirect without JavaScript", async () => {
    const response = await POST(request("http://localhost:3000", "text/html"))
    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/inicio"
    )
    expect(response.cookies.get("session")?.value).toBe("signed-in")
  })

  it("does not expose Auth details on a failed login", async () => {
    auth.signIn.mockResolvedValue({
      error: { message: "private backend details" },
    })
    const response = await POST(request())
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      ok: false,
      message: "El correo o la contraseña no son correctos.",
    })
    expect(response.cookies.get("session")?.value).toBe("signed-in")
  })
})
