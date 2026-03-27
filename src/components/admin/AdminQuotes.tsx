import React, { useState, useCallback, useEffect } from 'react'
import { Table, Card, Tab, Tabs, Modal, Form, Alert, Row, Col } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlClient } from '../../api/clients'
import { useListAllServicesQuery } from '../../api/operations/ops'
import * as adminApi from '../../api/admin-api'
import type { Quote, Invoice, LineItem, TimelineEvent } from '../../api/admin-api'
import { downloadQuotePdf, downloadInvoicePdf } from './pdf-utils'
import AdminPageHeader from './AdminPageHeader'

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`
}

function ensureLineIds(items: LineItem[]): LineItem[] {
  return items.map((li) => ({
    ...li,
    id: li.id && String(li.id).trim() ? li.id : newId(),
  }))
}

const emptyLineItem = (): LineItem => ({
  id: newId(),
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  serviceId: null,
})

const emptyTimelineEvent = (sortOrder: number): TimelineEvent => ({
  id: newId(),
  chartLabel: '',
  description: '',
  startDate: '',
  endDate: '',
  lineItemId: null,
  sortOrder,
})

function AddLineButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn btn-outline-primary btn-sm" onClick={onClick}>
      Add line
    </button>
  )
}

function QuoteForm({
  quote,
  serviceOptions,
  onSave,
  onCancel,
}: {
  quote?: Quote | null
  serviceOptions: { id: string; name: string }[]
  onSave: (input: adminApi.Quote & { lineItems: LineItem[]; timelineEvents: TimelineEvent[] }) => void
  onCancel: () => void
}) {
  const [clientName, setClientName] = useState(quote?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(quote?.clientEmail ?? '')
  const [status, setStatus] = useState(quote?.status ?? 'DRAFT')
  const [lineItems, setLineItems] = useState<LineItem[]>(() =>
    quote?.lineItems?.length ? ensureLineIds([...quote.lineItems]) : [emptyLineItem()]
  )
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() =>
    quote?.timelineEvents?.length
      ? quote.timelineEvents.map((e, i) => ({
          ...e,
          id: e.id && String(e.id).trim() ? e.id : newId(),
          sortOrder: e.sortOrder ?? i,
        }))
      : []
  )

  useEffect(() => {
    setClientName(quote?.clientName ?? '')
    setClientEmail(quote?.clientEmail ?? '')
    setStatus(quote?.status ?? 'DRAFT')
    setLineItems(quote?.lineItems?.length ? ensureLineIds([...quote.lineItems]) : [emptyLineItem()])
    setTimelineEvents(
      quote?.timelineEvents?.length
        ? quote.timelineEvents.map((e, i) => ({
            ...e,
            id: e.id && String(e.id).trim() ? e.id : newId(),
            sortOrder: e.sortOrder ?? i,
          }))
        : []
    )
  }, [quote?.id])

  const recalcTotal = useCallback(() => {
    return lineItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice || 0), 0)
  }, [lineItems])

  const updateLineItem = (idx: number, field: keyof LineItem, value: string | number | null) => {
    const next = lineItems.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unitPrice')
        updated.amount = Number(updated.quantity) * Number(updated.unitPrice)
      return updated
    })
    setLineItems(next)
  }

  const addLine = () => setLineItems((prev) => [...prev, emptyLineItem()])
  const removeLine = (idx: number) => setLineItems((prev) => prev.filter((_, i) => i !== idx))

  const updateTimeline = (idx: number, field: keyof TimelineEvent, value: string | number | null) => {
    setTimelineEvents((prev) =>
      prev.map((ev, i) => (i === idx ? { ...ev, [field]: value } : ev))
    )
  }

  const addTimeline = () =>
    setTimelineEvents((prev) => [...prev, emptyTimelineEvent(prev.length)])

  const removeTimeline = (idx: number) =>
    setTimelineEvents((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = recalcTotal()
    const items = lineItems.map((i) => ({
      ...i,
      amount: i.quantity * i.unitPrice,
    }))
    const events = timelineEvents
      .filter((ev) => ev.chartLabel.trim() && ev.startDate && ev.endDate)
      .map((ev, i) => ({
        ...ev,
        chartLabel: ev.chartLabel.trim(),
        description: ev.description?.trim() || null,
        lineItemId: ev.lineItemId && String(ev.lineItemId).trim() ? ev.lineItemId : null,
        sortOrder: ev.sortOrder ?? i,
      }))
    onSave({
      id: quote?.id ?? '',
      clientName,
      clientEmail,
      status,
      lineItems: items,
      total,
      timelineEvents: events,
      token: quote?.token ?? undefined,
      quoteAssetsPrefix: quote?.quoteAssetsPrefix ?? undefined,
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
          <Row key={item.id} className="mb-2 align-items-center g-1">
            <Col md={3}>
              <Form.Select
                aria-label="Catalog service (optional)"
                value={item.serviceId ?? ''}
                onChange={(e) =>
                  updateLineItem(idx, 'serviceId', e.target.value === '' ? null : e.target.value)
                }
              >
                <option value="">Service (optional)</option>
                {serviceOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Control
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
              />
            </Col>
            <Col md={1}>
              <Form.Control
                type="number"
                min={0}
                step={1}
                value={item.quantity}
                onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value) || 0)}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                min={0}
                step={0.01}
                value={item.unitPrice || ''}
                onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value) || 0)}
              />
            </Col>
            <Col md={1} className="text-white-50 small">
              {item.quantity * item.unitPrice}
            </Col>
            <Col xs="auto">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeLine(idx)}
              >
                Remove
              </button>
            </Col>
          </Row>
        ))}
        <AddLineButton onClick={addLine} />
      </div>

      <hr className="border-secondary my-4" />
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="mb-0">Timeline events</Form.Label>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={addTimeline}>
            Add event
          </button>
        </div>
        <p className="small text-white-50 mb-2">
          Short label appears on the chart; use the description for long scope notes. Link to a line item
          or leave deliverable empty for project-wide milestones.
        </p>
        {timelineEvents.map((ev, idx) => (
          <Card key={ev.id} className="mb-2 bg-dark border-secondary">
            <Card.Body className="py-2 px-3">
              <Row className="g-2">
                <Col md={3}>
                  <Form.Control
                    size="sm"
                    placeholder="Chart label (short)"
                    value={ev.chartLabel}
                    onChange={(e) => updateTimeline(idx, 'chartLabel', e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    aria-label="Deliverable"
                    value={ev.lineItemId ?? ''}
                    onChange={(e) =>
                      updateTimeline(
                        idx,
                        'lineItemId',
                        e.target.value === '' ? null : e.target.value
                      )
                    }
                  >
                    <option value="">Project milestone (no line)</option>
                    {lineItems.map((li) => (
                      <option key={li.id} value={li.id}>
                        {li.description || li.id.slice(0, 8)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={ev.startDate ? ev.startDate.slice(0, 10) : ''}
                    onChange={(e) => updateTimeline(idx, 'startDate', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={ev.endDate ? ev.endDate.slice(0, 10) : ''}
                    onChange={(e) => updateTimeline(idx, 'endDate', e.target.value)}
                  />
                </Col>
                <Col md={1} xs="auto">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeTimeline(idx)}
                  >
                    ×
                  </button>
                </Col>
                <Col xs={12}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    size="sm"
                    placeholder="Long description (scope, assumptions, deliverables…)"
                    value={ev.description ?? ''}
                    onChange={(e) => updateTimeline(idx, 'description', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      <p className="fw-bold">Total: ${recalcTotal().toFixed(2)}</p>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">
          {quote ? 'Update quote' : 'Create quote'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Form>
  )
}

export default function AdminQuotes() {
  const queryClient = useQueryClient()
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: listServicesData } = useListAllServicesQuery(graphqlClient)
  const serviceOptions = (listServicesData?.listAllServices ?? []).map((s) => ({
    id: s.id,
    name: s.name,
  }))

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
  const generatePackageMut = useMutation({
    mutationFn: adminApi.generateQuoteClientPackage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] }),
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const downloadPackageMut = useMutation({
    mutationFn: (quoteId: string) => adminApi.getQuoteClientPackageDownload(quoteId),
    onSuccess: (pkg) => {
      setError(null)
      if (pkg.files.length === 0) {
        setError('Package folder is empty.')
        return
      }
      pkg.files.forEach((f, i) => {
        window.setTimeout(() => {
          const a = document.createElement('a')
          a.href = f.downloadUrl
          a.download = f.fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
        }, i * 500)
      })
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })

  const handleSaveQuote = (raw: adminApi.Quote & { lineItems: LineItem[]; timelineEvents: TimelineEvent[] }) => {
    setError(null)
    const timelinePayload = raw.timelineEvents.map((e) => ({
      id: e.id,
      chartLabel: e.chartLabel,
      description: e.description,
      startDate: e.startDate.includes('T') ? e.startDate : `${e.startDate}T00:00:00.000Z`,
      endDate: e.endDate.includes('T') ? e.endDate : `${e.endDate}T23:59:59.999Z`,
      lineItemId: e.lineItemId,
      sortOrder: e.sortOrder,
    }))
    if (raw.id) {
      updateQuoteMut.mutate({
        id: raw.id,
        input: {
          clientName: raw.clientName,
          clientEmail: raw.clientEmail,
          status: raw.status,
          lineItems: raw.lineItems.map((li) => ({
            id: li.id,
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            amount: li.amount,
            serviceId: li.serviceId,
          })),
          total: raw.total,
          timelineEvents: timelinePayload,
        },
      })
    } else {
      createQuoteMut.mutate({
        clientName: raw.clientName,
        clientEmail: raw.clientEmail,
        status: raw.status,
        lineItems: raw.lineItems.map((li) => ({
          id: li.id,
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          amount: li.amount,
          serviceId: li.serviceId,
        })),
        total: raw.total,
        timelineEvents: timelinePayload,
      })
    }
  }

  const copyQuoteLink = (quote: Quote) => {
    if (!quote.token) return
    const url = `${window.location.origin}/quote/${quote.token}`
    navigator.clipboard.writeText(url)
  }

  const copyAssetsPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix)
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Billing"
        title="Quotes & invoices"
        description="Draft quotes, share client links, generate packages, and track invoices through payment."
      />
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs defaultActiveKey="quotes" className="mb-3 admin-tabs border-0">
        <Tab eventKey="quotes" title="Quotes">
          <Card className="admin-card mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="admin-card-heading mb-0">Quotes</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingQuote(null)
                    setShowQuoteModal(true)
                  }}
                >
                  New quote
                </button>
              </div>
              {quotesLoading ? (
                <p className="text-white-50">Loading…</p>
              ) : (
                <div className="admin-table-wrap">
                  <Table responsive size="sm" className="text-white admin-table mb-0">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>S3 prefix</th>
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
                          <td className="small text-white-50 text-truncate" style={{ maxWidth: 140 }} title={q.quoteAssetsPrefix ?? ''}>
                            {q.quoteAssetsPrefix ? (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-info small text-truncate d-inline-block"
                                style={{ maxWidth: 130 }}
                                onClick={() => copyAssetsPrefix(q.quoteAssetsPrefix!)}
                              >
                                {q.quoteAssetsPrefix}
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="admin-table-actions-cell admin-table-actions-cell--quote">
                            <div className="admin-table-actions admin-table-actions--stacked">
                              <div
                                className="admin-table-actions-group"
                                role="group"
                                aria-label="Quote record"
                              >
                                <span className="admin-table-actions-group-label">Quote</span>
                                <button
                                  type="button"
                                  className="btn btn-outline-light btn-sm"
                                  onClick={() => {
                                    setEditingQuote(q)
                                    setShowQuoteModal(true)
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteQuoteMut.mutate(q.id)}
                                >
                                  Delete
                                </button>
                              </div>
                              <div
                                className="admin-table-actions-group"
                                role="group"
                                aria-label="PDF and client package"
                              >
                                <span className="admin-table-actions-group-label">PDF & package</span>
                                <button
                                  type="button"
                                  className="btn btn-outline-light btn-sm"
                                  onClick={() => void downloadQuotePdf(q)}
                                >
                                  PDF
                                </button>
                                {q.token && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => copyQuoteLink(q)}
                                  >
                                    Copy link
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-outline-warning btn-sm"
                                  title="Generates quote.pdf, timeline.png, and timeline.html in S3"
                                  disabled={generatePackageMut.isPending}
                                  onClick={() => {
                                    setError(null)
                                    generatePackageMut.mutate(q.id)
                                  }}
                                >
                                  Client package
                                </button>
                                {q.quoteAssetsPrefix && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-info btn-sm"
                                    title="Download presigned links for files in S3"
                                    disabled={
                                      downloadPackageMut.isPending &&
                                      downloadPackageMut.variables === q.id
                                    }
                                    onClick={() => downloadPackageMut.mutate(q.id)}
                                  >
                                    {downloadPackageMut.isPending &&
                                    downloadPackageMut.variables === q.id
                                      ? 'Preparing…'
                                      : 'Download package'}
                                  </button>
                                )}
                              </div>
                              <div
                                className="admin-table-actions-group"
                                role="group"
                                aria-label="Invoice"
                              >
                                <span className="admin-table-actions-group-label">Invoice</span>
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm"
                                  disabled={convertMut.isPending}
                                  onClick={() => convertMut.mutate(q.id)}
                                >
                                  To invoice
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="invoices" title="Invoices">
          <Card className="admin-card">
            <Card.Body>
              <h2 className="admin-card-heading mb-3">Invoices</h2>
              {invoicesLoading ? (
                <p className="text-white-50">Loading…</p>
              ) : (
                <div className="admin-table-wrap">
                  <Table responsive size="sm" className="text-white admin-table mb-0">
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
                          <td className="admin-table-actions-cell">
                            <div
                              className="admin-table-actions-group"
                              role="group"
                              aria-label="Invoice actions"
                            >
                              <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={() => downloadInvoicePdf(inv)}
                              >
                                PDF
                              </button>
                              {inv.status !== 'PAID' && (
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm"
                                  disabled={markPaidMut.isPending}
                                  onClick={() => markPaidMut.mutate(inv.id)}
                                >
                                  Mark paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} size="xl" className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingQuote ? 'Edit quote' : 'New quote'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QuoteForm
            key={editingQuote?.id ?? 'new'}
            quote={editingQuote}
            serviceOptions={serviceOptions}
            onSave={handleSaveQuote}
            onCancel={() => setShowQuoteModal(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}
