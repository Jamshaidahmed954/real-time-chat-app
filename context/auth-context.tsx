"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Fetch user profile from database
          const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (error) throw error
          if (data) setUser(data)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (data) setUser(data)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push("/chat")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Sign up with Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (authError) throw authError
      if (!authUser) throw new Error("Signup failed")

      // Create user profile
      const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`

      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authUser.id,
          email,
          name,
          avatar_url,
          status: "online",
        },
      ])

      if (profileError) throw profileError
      router.push("/chat")
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
