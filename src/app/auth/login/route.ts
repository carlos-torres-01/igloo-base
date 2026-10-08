import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSupabaseConfig } from "@/lib/supabase/config"
import { loginSchema } from "@/lib/validations/auth"
import type { Database } from "@/types/database"

function destinationUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, request.nextUrl.origin)
}

function loginFailure(
  request: NextRequest,
  error: string,
  expectsJson: boolean
) {
  if (expectsJson) {
    return NextResponse.json({ ok: false, message: error }, { status: 400 })
  }

  const url = destinationUrl(request, "/login")
  url.searchParams.set("error", error)
  return NextResponse.redirect(url, 303)
}

export async function POST(request: NextRequest) {
  // This Route Handler does not receive Server Actions' automatic Origin check.
  const origin = request.headers.get("origin")
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin && origin !== request.nextUrl.origin)
  ) {
    return NextResponse.json(
      { ok: false, message: "Solicitud no permitida." },
      { status: 403 }
    )
  }
  const expectsJson =
    request.headers.get("accept")?.includes("application/json") ?? false
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return loginFailure(request, "Revisa los datos ingresados.", expectsJson)
  }
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return loginFailure(request, "Revisa los datos ingresados.", expectsJson)
  }

  const destination = destinationUrl(request, "/inicio")
  let response = expectsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(destination, 303)
  const { publishableKey, url } = getSupabaseConfig()
  response.headers.set("Cache-Control", "private, no-store")
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value)
        )
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    const previous = response
    response = loginFailure(
      request,
      "El correo o la contraseña no son correctos.",
      expectsJson
    )
    previous.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    response.headers.set("Cache-Control", "private, no-store")
  }

  return response
}
