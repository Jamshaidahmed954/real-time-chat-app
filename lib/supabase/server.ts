import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error("Missing Supabase environment variables")
}

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseServiceRole, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Handle error
        }
      },
    },
  })
}
