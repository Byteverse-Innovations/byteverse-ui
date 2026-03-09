import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  children: React.ReactNode
  /** If true, require admin role (isAdmin). Default true for admin routes. */
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = true }: Props) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-50 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace state={{ message: 'Access denied. Admin only.' }} />
  }

  return <>{children}</>
}
