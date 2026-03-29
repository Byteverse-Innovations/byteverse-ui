import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Spinner } from 'react-bootstrap'
import * as adminApi from '../../api/admin-api'

export default function AdminNotionCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    if (!code || !state) {
      setError('Missing Notion authorization code or state. Close this tab and try Connect again.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        await adminApi.completeNotionOAuth({ code, state })
        if (!cancelled) {
          navigate('/admin/services', { replace: true })
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <a href="/admin/services">Back to Services</a>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 text-white d-flex align-items-center gap-2">
      <Spinner animation="border" size="sm" />
      <span>Connecting Notion…</span>
    </div>
  )
}
