import React from 'react'
import { Table, Card } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import * as adminApi from '../../api/admin-api'
import './AdminQuotes.scss'

export default function AdminContacts() {
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'contactSubmissions'],
    queryFn: adminApi.listContactSubmissions,
  })

  return (
    <>
      <h1 className="h3 mb-4 text-white">Contact submissions</h1>
      <Card className="admin-card">
        <Card.Body>
          {isLoading ? (
            <p className="text-white-50">Loading…</p>
          ) : (
            <Table responsive size="sm" className="text-white admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Snippet</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.subject}</td>
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="text-white-50">
                      {(s.message ?? '').slice(0, 80)}
                      {(s.message?.length ?? 0) > 80 ? '…' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!isLoading && submissions.length === 0 && (
            <p className="text-white-50 mb-0">No contact submissions yet.</p>
          )}
        </Card.Body>
      </Card>
    </>
  )
}
