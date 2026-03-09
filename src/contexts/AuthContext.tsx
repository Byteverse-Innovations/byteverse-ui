import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser, signIn as amplifySignIn, signOut as amplifySignOut } from 'aws-amplify/auth'

/** Comma-separated list of usernames allowed to access admin. If unset, any authenticated user can access. */
const ADMIN_USERNAMES = (import.meta.env.VITE_ADMIN_USERNAMES ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

type AuthState = {
  user: { username: string; userId?: string } | null
  loading: boolean
  error: string | null
  /** True if current user is allowed to access admin (role-based). */
  isAdmin: boolean
}

type AuthContextValue = AuthState & {
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkUser = useCallback(async () => {
    try {
      const u = await getCurrentUser()
      const username = u.username ?? ''
      const admin =
        ADMIN_USERNAMES.length === 0 || ADMIN_USERNAMES.includes(username.toLowerCase())
      setUser({ username, userId: u.userId })
      setIsAdmin(admin)
    } catch {
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const signIn = useCallback(
    async (username: string, password: string) => {
      setError(null)
      setLoading(true)
      try {
        await amplifySignIn({ username, password })
        await checkUser()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        setUser(null)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [checkUser]
  )

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await amplifySignOut()
      setUser(null)
      setIsAdmin(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value: AuthContextValue = {
    user,
    loading,
    error,
    isAdmin,
    signIn,
    signOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
