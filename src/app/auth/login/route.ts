import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSupabaseConfig } from "@/lib/supabase/config"
import { loginSchema } from "@/lib/validations/auth"

function destinationUrl(request: NextRequest, pathname: string) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.slice(0, -1)
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin
  return new URL(pathname, origin)
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
  const expectsJson =
    request.headers.get("accept")?.includes("application/json") ?? false
  const formData = await request.formData()
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
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    response = loginFailure(
      request,
      "El correo o la contraseña no son correctos.",
      expectsJson
    )
  }

  return response
}
