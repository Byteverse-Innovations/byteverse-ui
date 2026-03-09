import React, { useState, useCallback } from 'react'
import { Table, Button, Card, Tab, Tabs, Modal, Form, Alert, Row, Col } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as adminApi from '../../api/admin-api'
import type { Quote, Invoice, LineItem } from '../../api/admin-api'
import { downloadQuotePdf, downloadInvoicePdf } from './pdf-utils'
import './AdminQuotes.scss'

const emptyLineItem: LineItem = { description: '', quantity: 1, unitPrice: 0, amount: 0 }

function QuoteForm({
  quote,
  onSave,
  onCancel,
}: {
  quote?: Quote | null
  onSave: (input: adminApi.Quote & { lineItems: LineItem[] }) => void
  onCancel: () => void
}) {
  const [clientName, setClientName] = useState(quote?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(quote?.clientEmail ?? '')
  const [status, setStatus] = useState(quote?.status ?? 'DRAFT')
  const [lineItems, setLineItems] = useState<LineItem[]>(
    quote?.lineItems?.length ? [...quote.lineItems] : [{ ...emptyLineItem }]
  )

  const recalcTotal = useCallback(() => {
    return lineItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice || 0), 0)
  }, [lineItems])

  const updateLineItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const next = lineItems.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unitPrice')
        updated.amount = Number(updated.quantity) * Number(updated.unitPrice)
      return updated
    })
    setLineItems(next)
  }

  const addLine = () => setLineItems((prev) => [...prev, { ...emptyLineItem }])
  const removeLine = (idx: number) => setLineItems((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = recalcTotal()
    const items = lineItems.map((i) => ({
      ...i,
      amount: i.quantity * i.unitPrice,
    }))
    onSave({
      id: quote?.id ?? '',
      clientName,
      clientEmail,
      status,
      lineItems: items,
      total,
      token: quote?.token ?? undefined,
      createdAt: quote?.createdAt ?? undefined,
      updatedAt: quote?.updatedAt ?? undefined,
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Client name</Form.Label>
        <Form.Control
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Client email</Form.Label>
        <Form.Control
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
        </Form.Select>
      </Form.Group>
      <div className="mb-2">
        <Form.Label>Line items</Form.Label>
        {lineItems.map((item, idx) => (
          <Row key={idx} className="mb-2 align-items-center">
            <Col>
              <Form.Control
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
              />
            </Col>
            <Col xs={2}>
              <Form.Control
                type="number"
                min={0}
                step={1}
                value={item.quantity}
                onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value) || 0)}
              />
            </Col>
            <Col xs={2}>
              <Form.Control
                type="number"
                min={0}
                step={0.01}
                value={item.unitPrice || ''}
                onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value) || 0)}
              />
            </Col>
            <Col xs={2}>{item.quantity * item.unitPrice}</Col>
            <Col xs="auto">
              <Button type="button" variant="outline-danger" size="sm" onClick={() => removeLine(idx)}>
                Remove
              </Button>
            </Col>
          </Row>
        ))}
        <Button type="button" variant="outline-primary" size="sm" onClick={addLine}>
          Add line
        </Button>
      </div>
      <p className="fw-bold">Total: ${recalcTotal().toFixed(2)}</p>
      <div className="d-flex gap-2">
        <Button type="submit" variant="primary">
          {quote ? 'Update quote' : 'Create quote'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  )
}

export default function AdminQuotes() {
  const queryClient = useQueryClient()
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['admin', 'quotes'],
    queryFn: adminApi.listQuotes,
  })
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: adminApi.listInvoices,
  })

  const createQuoteMut = useMutation({
    mutationFn: (input: Parameters<typeof adminApi.createQuote>[0]) => adminApi.createQuote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] })
      setShowQuoteModal(false)
      setEditingQuote(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const updateQuoteMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof adminApi.updateQuote>[1] }) =>
      adminApi.updateQuote(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] })
      setShowQuoteModal(false)
      setEditingQuote(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const deleteQuoteMut = useMutation({
    mutationFn: adminApi.deleteQuote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] }),
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const convertMut = useMutation({
    mutationFn: adminApi.convertQuoteToInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const markPaidMut = useMutation({
    mutationFn: adminApi.markInvoicePaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] }),
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })

  const handleSaveQuote = (raw: adminApi.Quote & { lineItems: LineItem[] }) => {
    setError(null)
    if (raw.id) {
      updateQuoteMut.mutate({
        id: raw.id,
        input: {
          clientName: raw.clientName,
          clientEmail: raw.clientEmail,
          status: raw.status,
          lineItems: raw.lineItems,
          total: raw.total,
        },
      })
    } else {
      createQuoteMut.mutate({
        clientName: raw.clientName,
        clientEmail: raw.clientEmail,
        status: raw.status,
        lineItems: raw.lineItems,
        total: raw.total,
      })
    }
  }

  const copyQuoteLink = (quote: Quote) => {
    if (!quote.token) return
    const url = `${window.location.origin}/quote/${quote.token}`
    navigator.clipboard.writeText(url)
  }

  return (
    <>
      <h1 className="h3 mb-4 text-white">Quotes & Invoices</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs defaultActiveKey="quotes" className="mb-3">
        <Tab eventKey="quotes" title="Quotes">
          <Card className="admin-card mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 text-white mb-0">Quotes</h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingQuote(null)
                    setShowQuoteModal(true)
                  }}
                >
                  New quote
                </Button>
              </div>
              {quotesLoading ? (
                <p className="text-white-50">Loading…</p>
              ) : (
                <Table responsive size="sm" className="text-white admin-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q.id}>
                        <td>{q.clientName}</td>
                        <td>{q.status}</td>
                        <td>${(q.total ?? 0).toFixed(2)}</td>
                        <td>{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="me-1"
                            onClick={() => downloadQuotePdf(q)}
                          >
                            PDF
                          </Button>
                          {q.token && (
                            <Button
                              variant="outline-light"
                              size="sm"
                              className="me-1"
                              onClick={() => copyQuoteLink(q)}
                            >
                              Copy link
                            </Button>
                          )}
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setEditingQuote(q)
                              setShowQuoteModal(true)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-1"
                            disabled={convertMut.isPending}
                            onClick={() => convertMut.mutate(q.id)}
                          >
                            To invoice
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteQuoteMut.mutate(q.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="invoices" title="Invoices">
          <Card className="admin-card">
            <Card.Body>
              <h2 className="h6 text-white mb-3">Invoices</h2>
              {invoicesLoading ? (
                <p className="text-white-50">Loading…</p>
              ) : (
                <Table responsive size="sm" className="text-white admin-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Due</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.clientName}</td>
                        <td>{inv.status}</td>
                        <td>${(inv.total ?? 0).toFixed(2)}</td>
                        <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="me-1"
                            onClick={() => downloadInvoicePdf(inv)}
                          >
                            PDF
                          </Button>
                          {inv.status !== 'PAID' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              disabled={markPaidMut.isPending}
                              onClick={() => markPaidMut.mutate(inv.id)}
                            >
                              Mark paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} size="lg" className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingQuote ? 'Edit quote' : 'New quote'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QuoteForm
            quote={editingQuote}
            onSave={handleSaveQuote}
            onCancel={() => setShowQuoteModal(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}
