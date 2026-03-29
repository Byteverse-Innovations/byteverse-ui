import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignIn,
} from 'aws-amplify/auth'

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

export type SignInResult = { success: true } | { newPasswordRequired: true }

type AuthContextValue = AuthState & {
  signIn: (username: string, password: string) => Promise<SignInResult>
  confirmNewPassword: (newPassword: string) => Promise<void>
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
    async (username: string, password: string): Promise<SignInResult> => {
      setError(null)
      setLoading(true)
      try {
        const result = await amplifySignIn({ username, password })
        const step = (result as { nextStep?: { signInStep?: string } })?.nextStep?.signInStep
        if (step === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          setLoading(false)
          return { newPasswordRequired: true }
        }
        await checkUser()
        return { success: true }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const errObj = err as { name?: string; code?: string; ChallengeName?: string }
        const isNewPasswordRequired =
          errObj?.name === 'NewPasswordRequiredException' ||
          errObj?.code === 'NewPasswordRequiredException' ||
          errObj?.ChallengeName === 'NEW_PASSWORD_REQUIRED' ||
          /NEW_PASSWORD_REQUIRED/i.test(message) ||
          (typeof message === 'string' && message.includes('NEW_PASSWORD_REQUIRED'))
        if (isNewPasswordRequired) {
          setError(null)
          setLoading(false)
          return { newPasswordRequired: true }
        }
        setError(message)
        setUser(null)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [checkUser]
  )

  const confirmNewPassword = useCallback(
    async (newPassword: string) => {
      setError(null)
      setLoading(true)
      try {
        await confirmSignIn({ challengeResponse: newPassword })
        await checkUser()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
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
    confirmNewPassword,
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
