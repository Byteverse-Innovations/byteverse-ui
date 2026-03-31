import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap'
import { getQuoteByToken, acceptQuote } from '../../api/quote-portal-api'
import type { LineItem, Quote } from '../../api/admin-api'
import { lineItemPayableAmount, quoteDisplayTotal, lineItemTitleDescriptionParts } from '../../lib/quote-display'
import logoMark from '../../assets/icon-only-transparent-no-buffer.png'
import './QuotePortal.scss'

function LineItemTableRows({ items, depth = 0 }: { items: LineItem[]; depth?: number }) {
  return (
    <>
      {items.map((item) => {
        const children = item.subLineItems ?? []
        const hasChildren = children.length > 0
        const isSubLine = depth > 0
        const rateCell = isSubLine ? '-' : `$${item.unitPrice.toFixed(2)}`
        const qtyCell = isSubLine ? '-' : String(item.quantity)
        const amtCell = isSubLine ? '-' : `$${lineItemPayableAmount(item).toFixed(2)}`
        const { title, description } = lineItemTitleDescriptionParts(item)
        const hasDesc = description.trim().length > 0
        return (
          <React.Fragment key={item.id}>
            <tr>
              <td className="quote-line-item-desc-cell" style={{ paddingLeft: `${depth * 1.15}rem` }}>
                {title ? (
                  <>
                    <div className="quote-line-item-desc__title">{title}</div>
                    {hasDesc ? (
                      <div className="quote-line-item-desc__detail">{description}</div>
                    ) : null}
                  </>
                ) : (
                  <div className="quote-line-item-desc__title quote-line-item-desc__title--solo">
                    {hasDesc ? description : '—'}
                  </div>
                )}
              </td>
              <td className="quote-line-items-table__num">{rateCell}</td>
              <td className="quote-line-items-table__num">{qtyCell}</td>
              <td className="quote-line-items-table__num">{amtCell}</td>
            </tr>
            {hasChildren ? <LineItemTableRows items={children} depth={depth + 1} /> : null}
          </React.Fragment>
        )
      })}
    </>
  )
}

export default function QuotePortal() {
  const { token } = useParams<{ token: string }>()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<'idle' | 'accept' | 'decline'>('idle')
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('Missing quote link.')
      return
    }
    getQuoteByToken(token)
      .then((q) => {
        setQuote(q ?? null)
        if (!q) setError('Quote not found or link has expired.')
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    if (!quote?.id || !quote?.token) return
    setAction('accept')
    setError(null)
    try {
      const updated = await acceptQuote(quote.id, quote.token)
      if (updated) setDone('accepted')
      else setError('Unable to accept quote.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setAction('idle')
    }
  }

  const handleDecline = () => {
    setDone('declined')
    setAction('idle')
  }

  if (loading) {
    return (
      <div className="quote-portal d-flex justify-content-center align-items-center min-vh-50 py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error && !quote) {
    return (
      <div className="quote-portal container py-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    )
  }

  if (done === 'accepted') {
    return (
      <div className="quote-portal container py-5">
        <Card className="quote-portal-card">
          <Card.Body>
            <h1 className="h4 text-success">Quote accepted</h1>
            <p className="mb-0">Thank you. We will be in touch shortly.</p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  if (done === 'declined') {
    return (
      <div className="quote-portal container py-5">
        <Card className="quote-portal-card">
          <Card.Body>
            <h1 className="h4 text-white">Quote declined</h1>
            <p className="mb-0">You have declined this quote. Contact us if you change your mind.</p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  if (!quote) return null

  const displayTotal = quoteDisplayTotal(quote.lineItems, quote.total)

  return (
    <div className="quote-portal container py-5">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Card className="quote-portal-card">
        <Card.Body>
          <header className="quote-portal-brand mb-4">
            <img src={logoMark} alt="" className="quote-portal-brand-logo" width={44} height={44} />
            <div>
              <div className="quote-portal-brand-name">Byteverse</div>
              <div className="quote-portal-brand-tagline">reach@byteverseinnov.com</div>
            </div>
          </header>
          <h1 className="h5 text-white mb-3">Your quote</h1>
          <p className="text-white-50 mb-2">
            Client: <strong className="text-white">{quote.clientName}</strong> ({quote.clientEmail})
          </p>
          <p className="text-white-50 mb-3">Status: {quote.status}</p>
          <Table size="sm" className="text-white mb-4 quote-line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="quote-line-items-table__num">Rate</th>
                <th className="quote-line-items-table__num">Qty</th>
                <th className="quote-line-items-table__num">Amount</th>
              </tr>
            </thead>
            <tbody>
              <LineItemTableRows items={quote.lineItems ?? []} />
            </tbody>
          </Table>
          <p className="fw-bold text-white">Total: ${displayTotal.toFixed(2)}</p>
          {quote.status === 'SENT' && (
            <div className="d-flex gap-2 mt-3">
              <Button
                variant="success"
                onClick={handleAccept}
                disabled={action === 'accept'}
              >
                {action === 'accept' ? 'Accepting…' : 'Accept quote'}
              </Button>
              <Button variant="outline-secondary" onClick={handleDecline}>
                Decline
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
