import React from 'react'
import { Table, Card, Badge } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import * as adminApi from '../../api/admin-api'
import './AdminQuotes.scss'

type ClientRow = {
  id: string
  name: string
  email: string
  source: 'quote' | 'contact'
  lastActivity: string
  status?: string
  quoteCount?: number
  contactCount?: number
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export default function AdminClients() {
  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['admin', 'quotes'],
    queryFn: adminApi.listQuotes,
  })
  const { data: submissions = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['admin', 'contactSubmissions'],
    queryFn: adminApi.listContactSubmissions,
  })

  const isLoading = quotesLoading || contactsLoading

  // Aggregate by email (normalized)
  const byEmail = new Map<
    string,
    {
      name: string
      email: string
      lastActivity: Date
      quoteCount: number
      contactCount: number
      lastStatus?: string
    }
  >()

  for (const q of quotes) {
    const key = normalizeEmail(q.clientEmail)
    const existing = byEmail.get(key)
    const updatedAt = q.updatedAt || q.createdAt
    const date = updatedAt ? new Date(updatedAt) : new Date(0)
    if (!existing) {
      byEmail.set(key, {
        name: q.clientName,
        email: q.clientEmail,
        lastActivity: date,
        quoteCount: 1,
        contactCount: 0,
        lastStatus: q.status,
      })
    } else {
      if (date > existing.lastActivity) {
        existing.lastActivity = date
        existing.lastStatus = q.status
      }
      existing.quoteCount += 1
      if (q.clientName && !existing.name) existing.name = q.clientName
    }
  }

  for (const s of submissions) {
    const key = normalizeEmail(s.email)
    const existing = byEmail.get(key)
    const date = s.createdAt ? new Date(s.createdAt) : new Date(0)
    if (!existing) {
      byEmail.set(key, {
        name: s.name,
        email: s.email,
        lastActivity: date,
        quoteCount: 0,
        contactCount: 1,
      })
    } else {
      if (date > existing.lastActivity) existing.lastActivity = date
      existing.contactCount += 1
      if (s.name && !existing.name) existing.name = s.name
    }
  }

  const rows: ClientRow[] = Array.from(byEmail.entries())
    .map(([_, v]) => ({
      id: v.email,
      name: v.name,
      email: v.email,
      source: v.quoteCount > 0 ? 'quote' : 'contact',
      lastActivity: v.lastActivity.toISOString(),
      status: v.lastStatus,
      quoteCount: v.quoteCount,
      contactCount: v.contactCount,
    }))
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

  return (
    <>
      <h1 className="h3 mb-4 text-white">Clients</h1>
      <Card className="admin-card">
        <Card.Body>
          <p className="text-white-50 small mb-3">
            Aggregated from quotes and contact form submissions. Activity and status reflect latest
            quote or contact.
          </p>
          {isLoading ? (
            <p className="text-white-50">Loading…</p>
          ) : (
            <Table responsive size="sm" className="text-white admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last activity</th>
                  <th>Status</th>
                  <th>Quotes</th>
                  <th>Contacts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name || '—'}</td>
                    <td>{r.email}</td>
                    <td className="text-white-50">
                      {r.lastActivity
                        ? new Date(r.lastActivity).toLocaleDateString(undefined, {
                            dateStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td>
                      {r.status && (
                        <Badge bg="secondary" text="dark">
                          {r.status}
                        </Badge>
                      )}
                    </td>
                    <td>{r.quoteCount ?? 0}</td>
                    <td>{r.contactCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!isLoading && rows.length === 0 && (
            <p className="text-white-50 mb-0">No clients yet (no quotes or contact submissions).</p>
          )}
        </Card.Body>
      </Card>
    </>
  )
}
