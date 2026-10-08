import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabaseConfig } from "@/lib/supabase/config"
import type { Database } from "@/types/database"

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })
  const { publishableKey, url } = getSupabaseConfig()

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        const previous = response
        response = NextResponse.next({ request })
        previous.cookies
          .getAll()
          .forEach((cookie) => response.cookies.set(cookie))
        for (const header of ["Cache-Control", "Expires", "Pragma"]) {
          const value = previous.headers.get(header)
          if (value) response.headers.set(header, value)
        }
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value)
        )
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims)
  const isLoginRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/auth/login"

  if (!isAuthenticated && !isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    const redirectResponse = NextResponse.redirect(url)
    response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie))
    for (const header of ["Cache-Control", "Expires", "Pragma"]) {
      const value = response.headers.get(header)
      if (value) redirectResponse.headers.set(header, value)
    }
    return redirectResponse
  }

  return response
}
