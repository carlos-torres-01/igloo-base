import { describe, expect, it } from "vitest"

import { generatePassword } from "./password"

describe("generatePassword", () => {
  it("creates a 20-character password with every character class", () => {
    const password = generatePassword()
    expect(password).toHaveLength(20)
    expect(password).toMatch(/[A-Z]/)
    expect(password).toMatch(/[a-z]/)
    expect(password).toMatch(/[0-9]/)
    expect(password).toMatch(/[!@#$%*_-]/)
  })

  it("rejects invalid lengths", () => {
    expect(() => generatePassword(3)).toThrow(RangeError)
    expect(() => generatePassword(129)).toThrow(RangeError)
  })
})
