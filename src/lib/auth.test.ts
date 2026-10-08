import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), profile: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("react", () => ({ cache: (fn: unknown) => fn }))
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`)
  },
}))
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mocks.profile }) }),
    }),
  }),
}))

import { requireAdmin, requireUser } from "@/lib/auth"

describe("server access guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user" } },
      error: null,
    })
    mocks.profile.mockResolvedValue({
      data: { id: "user", role: "user", is_active: true },
      error: null,
    })
  })

  it("rejects a missing session before querying profiles", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login")
    expect(mocks.profile).not.toHaveBeenCalled()
  })

  it("routes a missing profile to an access explanation, avoiding a login loop", async () => {
    mocks.profile.mockResolvedValue({ data: null, error: null })
    await expect(requireUser()).rejects.toThrow("REDIRECT:/acceso-inactivo")
  })

  it("blocks inactive users", async () => {
    mocks.profile.mockResolvedValue({
      data: { role: "admin", is_active: false },
      error: null,
    })
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/acceso-inactivo")
  })

  it("blocks a regular user from admin operations", async () => {
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/inicio")
  })

  it("does not disguise a database failure as a missing profile", async () => {
    const failure = new Error("database unavailable")
    mocks.profile.mockResolvedValue({ data: null, error: failure })
    await expect(requireUser()).rejects.toBe(failure)
  })
})
