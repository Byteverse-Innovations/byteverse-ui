import React from 'react'
import { Table, Card } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import * as adminApi from '../../api/admin-api'
import AdminPageHeader from './AdminPageHeader'

export default function AdminContacts() {
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'contactSubmissions'],
    queryFn: adminApi.listContactSubmissions,
  })

  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact submissions"
        description="Site enquiries and lead messages — triage and follow up from one place."
      />
      <Card className="admin-card">
        <Card.Body>
          {isLoading ? (
            <p className="text-white-50">Loading…</p>
          ) : (
            <div className="admin-table-wrap">
              <Table responsive size="sm" className="text-white admin-table mb-0">
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
            </div>
          )}
          {!isLoading && submissions.length === 0 && (
            <p className="text-white-50 mb-0">No contact submissions yet.</p>
          )}
        </Card.Body>
      </Card>
    </>
  )
}
