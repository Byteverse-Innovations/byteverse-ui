import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Accordion,
  Alert,
  Badge,
  Card,
  Col,
  Form,
  Modal,
  Nav,
  ProgressBar,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlClient } from '../../api/clients'
import { useListAllServicesQuery, type ListAllServicesQuery } from '../../api/operations/ops'
import * as adminApi from '../../api/admin-api'
import type { Quote, Invoice, LineItem, TimelineEvent } from '../../api/admin-api'
import { downloadQuotePdf, downloadInvoicePdf } from './pdf-utils'
import AdminPageHeader from './AdminPageHeader'
import {
  eventRangeLabelForClient,
  formatClientFacingDate,
  lineItemPayableAmount,
  quoteDisplayTotal,
  quoteLineItemsSubtotal,
  timelineDaySpanLabel,
} from '../../lib/quote-display'

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`
}

function ensureLineIdsDeep(items: LineItem[]): LineItem[] {
  return items.map((li) => ({
    ...li,
    id: li.id && String(li.id).trim() ? li.id : newId(),
    subLineItems: ensureLineIdsDeep(li.subLineItems ?? []),
  }))
}

const emptyLineItem = (): LineItem => ({
  id: newId(),
  title: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  serviceId: null,
  subLineItems: [],
})

/** Match ms-billing: only top-level rows carry price; all descendants are descriptive. */
function prepareDescendantLineSave(li: LineItem): LineItem {
  const subs = (li.subLineItems ?? []).map(prepareDescendantLineSave)
  return {
    ...li,
    quantity: 0,
    unitPrice: 0,
    amount: 0,
    subLineItems: subs,
  }
}

function prepareLineItemsForSave(items: LineItem[]): LineItem[] {
  return items.map((li) => {
    const subs = (li.subLineItems ?? []).map(prepareDescendantLineSave)
    if (subs.length > 0) {
      const q = Number(li.quantity) || 0
      const p = Number(li.unitPrice) || 0
      const amt = Number(li.amount) || q * p
      return { ...li, subLineItems: subs, quantity: q, unitPrice: p, amount: amt }
    }
    const q = Number(li.quantity) || 0
    const p = Number(li.unitPrice) || 0
    return { ...li, subLineItems: [], quantity: q, unitPrice: p, amount: q * p }
  })
}

/** GraphQL `Service.price` is a String; Notion/content may use commas or currency symbols. */
function parseServiceCatalogPrice(raw: unknown): number | null {
  if (raw == null) return null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const s = String(raw).trim()
  if (!s) return null
  const compact = s.replace(/[$€£\s]/g, '').replace(/,/g, '')
  const match = compact.match(/-?\d*\.?\d+/)
  if (!match) return null
  const n = parseFloat(match[0])
  return Number.isFinite(n) ? n : null
}

function updateLineAtPath(
  items: LineItem[],
  path: number[],
  field: keyof LineItem,
  value: string | number | null
): LineItem[] {
  if (path.length === 0) return items
  const [head, ...rest] = path
  if (rest.length === 0) {
    return items.map((li, idx) => {
      if (idx !== head) return li
      const updated = { ...li, [field]: value } as LineItem
      if (field === 'quantity' || field === 'unitPrice') {
        const q = Number(updated.quantity) || 0
        const p = Number(updated.unitPrice) || 0
        updated.amount = q * p
      }
      return updated
    })
  }
  return items.map((li, idx) =>
    idx === head
      ? { ...li, subLineItems: updateLineAtPath(li.subLineItems ?? [], rest, field, value) }
      : li
  )
}

/** Priced package row only (`path` length 1): set `servicePrice` from catalog when present; qty defaults to 1 if unset. Values remain editable. */
function applyServiceCatalogToPackageLine(
  items: LineItem[],
  path: number[],
  serviceId: string | null,
  catalogUnitPrice: number | null | undefined
): LineItem[] {
  if (path.length !== 1) return items
  const idx = path[0]!
  return items.map((li, i) => {
    if (i !== idx) return li
    if (!serviceId) {
      return { ...li, serviceId: null }
    }
    const base: LineItem = { ...li, serviceId }
    if (typeof catalogUnitPrice === 'number' && Number.isFinite(catalogUnitPrice)) {
      const p = catalogUnitPrice
      const qRaw = Number(li.quantity) || 0
      const q = qRaw > 0 ? qRaw : 1
      return { ...base, quantity: q, unitPrice: p, amount: q * p }
    }
    return base
  })
}

function removeLineAtPath(items: LineItem[], path: number[]): LineItem[] {
  if (path.length === 1) return items.filter((_, i) => i !== path[0])
  const [head, ...rest] = path
  return items.map((li, idx) =>
    idx === head ? { ...li, subLineItems: removeLineAtPath(li.subLineItems ?? [], rest) } : li
  )
}

function addSubLineAtPath(items: LineItem[], path: number[]): LineItem[] {
  const [head, ...rest] = path
  if (rest.length === 0) {
    return items.map((li, idx) =>
      idx === head
        ? { ...li, subLineItems: [...(li.subLineItems ?? []), emptyLineItem()] }
        : li
    )
  }
  return items.map((li, idx) =>
    idx === head ? { ...li, subLineItems: addSubLineAtPath(li.subLineItems ?? [], rest) } : li
  )
}

function flattenLineItemsForSelect(items: LineItem[], prefix = ''): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []
  for (const li of items) {
    const labelBits = [li.title?.trim(), li.description?.trim()].filter(Boolean).join(' — ')
    const base = labelBits || li.id.slice(0, 8)
    const label = prefix ? `${prefix} › ${base}` : base
    out.push({ id: li.id, label })
    out.push(...flattenLineItemsForSelect(li.subLineItems ?? [], label))
  }
  return out
}

/** All nested rows under a package (not counting the package row itself). */
function countDescendantLineRows(items: LineItem[]): number {
  if (!items.length) return 0
  return items.reduce((sum, li) => sum + 1 + countDescendantLineRows(li.subLineItems ?? []), 0)
}

function countAllLineRows(items: LineItem[]): number {
  return items.reduce((sum, li) => sum + 1 + countAllLineRows(li.subLineItems ?? []), 0)
}

function timelineChartReadyCount(events: TimelineEvent[]): number {
  return events.filter((e) => e.chartLabel.trim() && e.startDate && e.endDate).length
}

function sortedTimelineEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const o = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (o !== 0) return o
    return String(a.startDate).localeCompare(String(b.startDate))
  })
}

function parseTimelineDate(iso: string): Date | null {
  const s = String(iso ?? '').trim()
  if (!s || s.length < 10) return null
  const d = new Date(s.slice(0, 10) + 'T12:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

/** Mini Gantt preview aligned with client PDF timeline (chart-ready rows show solid bars). */
function AdminQuoteTimelinePreview({ events }: { events: TimelineEvent[] }) {
  const rows = useMemo(() => {
    return sortedTimelineEvents(events).map((ev, i) => {
      const ready = !!(ev.chartLabel.trim() && ev.startDate && ev.endDate)
      const start = parseTimelineDate(ev.startDate)
      const end = parseTimelineDate(ev.endDate)
      const label = ev.chartLabel.trim() || `Event ${i + 1}`
      return { id: ev.id, ready, start, end, label, ev }
    })
  }, [events])

  const { minMs, maxMs, span } = useMemo(() => {
    let min = Infinity
    let max = -Infinity
    for (const r of rows) {
      if (r.ready && r.start && r.end) {
        const a = r.start.getTime()
        const b = r.end.getTime()
        const lo = Math.min(a, b)
        const hi = Math.max(a, b)
        min = Math.min(min, lo)
        max = Math.max(max, hi)
      } else {
        if (r.start) {
          const t = r.start.getTime()
          min = Math.min(min, t)
          max = Math.max(max, t)
        }
        if (r.end) {
          const t = r.end.getTime()
          min = Math.min(min, t)
          max = Math.max(max, t)
        }
      }
    }
    if (!Number.isFinite(min)) {
      const now = Date.now()
      return { minMs: now, maxMs: now + 30 * 86400000, span: 30 * 86400000 }
    }
    if (!Number.isFinite(max) || max <= min) {
      max = min + 7 * 86400000
    }
    return { minMs: min, maxMs: max, span: Math.max(max - min, 86400000) }
  }, [rows])

  const pctOf = (ms: number) => ((ms - minMs) / span) * 100

  if (events.length === 0) {
    return (
      <Card className="quote-timeline-preview-card border-secondary h-100">
        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-white-50 small py-5 px-3 text-center">
          <span className="text-white-50 mb-1 fw-semibold">Timeline preview</span>
          Add milestones below to see how they lay out on the client chart.
        </Card.Body>
      </Card>
    )
  }

  const msToYmdLocal = (ms: number) => {
    const d = new Date(ms)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const axisStart = formatClientFacingDate(msToYmdLocal(minMs))
  const axisEnd = formatClientFacingDate(msToYmdLocal(maxMs))

  return (
    <Card className="quote-timeline-preview-card border-secondary h-100">
      <Card.Header className="quote-timeline-preview-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-2 px-3">
        <span className="fw-semibold text-white">Timeline preview</span>
        <Badge bg="info" className="rounded-pill fw-normal">
          {rows.filter((r) => r.ready).length}/{rows.length} on chart
        </Badge>
      </Card.Header>
      <Card.Body className="pt-3 pb-2 quote-timeline-preview-body">
        <div className="quote-timeline-preview-axis small text-white-50 mb-3">
          <span>{axisStart}</span>
          <span className="mx-2 opacity-50">·</span>
          <span>{axisEnd}</span>
        </div>
        {rows.map((r) => {
          const days =
            r.ready && r.ev.startDate && r.ev.endDate
              ? timelineDaySpanLabel(r.ev.startDate, r.ev.endDate)
              : ''
          let bar: React.ReactNode
          if (r.ready && r.start && r.end) {
            const lo = Math.min(r.start.getTime(), r.end.getTime())
            const hi = Math.max(r.start.getTime(), r.end.getTime())
            const left = Math.max(0, Math.min(100, pctOf(lo)))
            const right = Math.max(0, Math.min(100, pctOf(hi)))
            const width = Math.max(right - left, 1.25)
            bar = (
              <div
                className="quote-timeline-preview-bar quote-timeline-preview-bar--ready"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${r.label}${days ? ` · ${days}` : ''}`}
              />
            )
          } else if (r.start || r.end) {
            const t = (r.start ?? r.end)!.getTime()
            const p = Math.max(0, Math.min(100, pctOf(t)))
            bar = (
              <div
                className="quote-timeline-preview-bar quote-timeline-preview-bar--partial"
                style={{ left: `${p}%`, width: '8%' }}
                title="Needs both start and end dates for the chart"
              />
            )
          } else {
            bar = (
              <div className="quote-timeline-preview-incomplete-hint small text-warning">
                Add dates &amp; label for chart
              </div>
            )
          }
          return (
            <div key={r.id} className="quote-timeline-preview-row mb-3">
              <div className="quote-timeline-preview-label text-white small fw-semibold text-truncate" title={r.label}>
                {r.label}
              </div>
              {r.ready ? (
                <div className="quote-timeline-preview-sub text-white-50 small mb-1">
                  {eventRangeLabelForClient(r.ev)}
                </div>
              ) : null}
              <div className="quote-timeline-preview-track position-relative">{bar}</div>
            </div>
          )
        })}
        <p className="text-white-50 small mb-0 mt-2 pt-2 border-top border-secondary">
          Solid bars match what clients see after save. Dashed markers mean dates are still incomplete.
        </p>
      </Card.Body>
    </Card>
  )
}

type LineItemMutationInput = {
  id: string
  title?: string | null
  description: string
  quantity: number
  unitPrice: number
  amount: number
  serviceId?: string | null
  subLineItems: LineItemMutationInput[]
}

function lineItemToMutationInput(li: LineItem): LineItemMutationInput {
  return {
    id: li.id,
    title: li.title?.trim() ? li.title.trim() : null,
    description: li.description,
    quantity: li.quantity,
    unitPrice: li.unitPrice,
    amount: li.amount,
    serviceId: li.serviceId,
    subLineItems: (li.subLineItems ?? []).map(lineItemToMutationInput),
  }
}

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

type CatalogServiceRow = ListAllServicesQuery['listAllServices'][number]

type ServiceSelectOption = { id: string; name: string }

type ServiceOptionGroup = { category: string; services: ServiceSelectOption[] }

function buildServiceOptionGroups(catalog: ReadonlyArray<CatalogServiceRow>): ServiceOptionGroup[] {
  const byCat = new Map<string, ServiceSelectOption[]>()
  for (const s of catalog) {
    const category = s.category?.trim() || 'Uncategorized'
    if (!byCat.has(category)) byCat.set(category, [])
    byCat.get(category)!.push({ id: s.id, name: s.name })
  }
  const groups: ServiceOptionGroup[] = [...byCat.entries()].map(([category, services]) => ({
    category,
    services: [...services].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
  }))
  groups.sort((a, b) => {
    if (a.category === 'Uncategorized') return 1
    if (b.category === 'Uncategorized') return -1
    return a.category.localeCompare(b.category, undefined, { sensitivity: 'base' })
  })
  return groups
}

function LineItemRowsEditor({
  items,
  pathPrefix,
  depth,
  serviceOptionGroups,
  onUpdate,
  onPickCatalogService,
  onAddSubLine,
  onRemove,
}: {
  items: LineItem[]
  pathPrefix: number[]
  depth: number
  serviceOptionGroups: ServiceOptionGroup[]
  onUpdate: (path: number[], field: keyof LineItem, value: string | number | null) => void
  /** When set, choosing a service on a priced package fills unit price from the catalog (still editable). */
  onPickCatalogService?: (path: number[], serviceId: string | null) => void
  onAddSubLine: (path: number[]) => void
  onRemove: (path: number[]) => void
}) {
  if (depth === 0 && items.length === 0) {
    return <p className="text-white-50 small mb-0">No packages yet — add one below.</p>
  }

  const nodes = items.map((item, idx) => {
    const path = [...pathPrefix, idx]
    const subs = item.subLineItems ?? []
    const isNested = depth > 0
    const displayAmount = isNested ? null : lineItemPayableAmount(item)
    const blockClass = `quote-line-item-block${isNested ? ' quote-line-item-block--nested' : ''}`
    const row = (
      <div
        className={blockClass}
        style={isNested ? { marginLeft: Math.min(depth, 6) * 16 } : undefined}
      >
        <Row className="g-3 mb-1">
          <Col md={isNested ? 12 : 5} lg={isNested ? 12 : 4}>
            <Form.Label className="quote-line-label mb-1">Service (optional)</Form.Label>
            <Form.Select
              className="quote-line-input-lg"
              aria-label="Catalog service (optional)"
              value={item.serviceId ?? ''}
              onChange={(e) => {
                const id = e.target.value === '' ? null : e.target.value
                if (!isNested && onPickCatalogService) {
                  onPickCatalogService(path, id)
                  return
                }
                onUpdate(path, 'serviceId', id)
              }}
            >
              <option value="">None</option>
              {serviceOptionGroups.map((g) => (
                <optgroup key={g.category} label={g.category}>
                  {g.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Form.Select>
          </Col>
          {!isNested ? (
            <>
              <Col md={3} lg={2}>
                <Form.Label className="quote-line-label mb-1">Qty</Form.Label>
                <Form.Control
                  className="quote-line-input-lg"
                  type="number"
                  min={0}
                  step={1}
                  value={item.quantity}
                  onChange={(e) => onUpdate(path, 'quantity', Number(e.target.value) || 0)}
                />
              </Col>
              <Col md={4} lg={3}>
                <Form.Label className="quote-line-label mb-1">Unit price</Form.Label>
                <Form.Control
                  className="quote-line-input-lg"
                  type="number"
                  min={0}
                  step={0.01}
                  value={Number.isFinite(item.unitPrice) ? item.unitPrice : ''}
                  onChange={(e) => onUpdate(path, 'unitPrice', Number(e.target.value) || 0)}
                />
              </Col>
              <Col md={12} lg={3} className="d-flex flex-column justify-content-end">
                <Form.Label className="quote-line-label mb-1">Line total</Form.Label>
                <div className="quote-line-amount-pill">
                  {displayAmount != null ? `$${displayAmount.toFixed(2)}` : '—'}
                </div>
              </Col>
            </>
          ) : (
            <Col xs={12}>
              <span className="text-white-50 small">Sub-lines are descriptive only; pricing rolls up to the package.</span>
            </Col>
          )}
        </Row>
        <Row className="g-3 mb-1">
          <Col xs={12}>
            <Form.Label className="quote-line-label mb-1">{isNested ? 'Sub-line title' : 'Package title'}</Form.Label>
            <Form.Control
              className="quote-line-input-lg"
              placeholder={isNested ? 'e.g. Phase detail, deliverable name' : 'e.g. Discovery & design sprint'}
              value={item.title ?? ''}
              onChange={(e) => onUpdate(path, 'title', e.target.value)}
            />
          </Col>
        </Row>
        <Row className="g-3 mb-2">
          <Col xs={12}>
            <Form.Label className="quote-line-label mb-1">Description &amp; scope notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={isNested ? 3 : 4}
              className="quote-line-textarea"
              placeholder="What’s included, assumptions, links—clients see this in the PDF."
              value={item.description}
              onChange={(e) => onUpdate(path, 'description', e.target.value)}
            />
          </Col>
        </Row>
        <div className="d-flex flex-wrap gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-info btn-sm"
            onClick={() => onAddSubLine(path)}
          >
            + Sub-line
          </button>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onRemove(path)}>
            Remove
          </button>
        </div>
      </div>
    )

    const nested = (
      <LineItemRowsEditor
        items={subs}
        pathPrefix={path}
        depth={depth + 1}
        serviceOptionGroups={serviceOptionGroups}
        onUpdate={onUpdate}
        onPickCatalogService={onPickCatalogService}
        onAddSubLine={onAddSubLine}
        onRemove={onRemove}
      />
    )

    if (depth === 0) {
      const subRows = countDescendantLineRows(subs)
      const label = item.title?.trim() || item.description?.trim() || 'Untitled package'
      return (
        <Accordion.Item
          key={item.id}
          eventKey={String(idx)}
          className="bg-dark border border-secondary rounded-2 mb-2 overflow-hidden"
        >
          <Accordion.Header className="admin-quote-package-header">
            <span className="d-flex align-items-center gap-2 flex-wrap w-100 pe-2">
              <Badge bg="primary" className="rounded-pill">
                {idx + 1}
              </Badge>
              <span className="fw-semibold text-truncate" style={{ maxWidth: 280 }}>
                {label}
              </span>
              {subRows > 0 ? (
                <Badge bg="secondary" className="rounded-pill">
                  {subRows} sub-line{subRows === 1 ? '' : 's'}
                </Badge>
              ) : null}
              <Badge bg="success" className="ms-md-auto">
                ${lineItemPayableAmount(item).toFixed(2)}
              </Badge>
            </span>
          </Accordion.Header>
          <Accordion.Body className="quote-line-accordion-body bg-dark pt-3 pb-3 border-top border-secondary">
            {row}
            {nested}
          </Accordion.Body>
        </Accordion.Item>
      )
    }

    return (
      <React.Fragment key={item.id}>
        {row}
        {nested}
      </React.Fragment>
    )
  })

  if (depth === 0) {
    return (
      <Accordion alwaysOpen defaultActiveKey={items.map((_, i) => String(i))}>
        {nodes}
      </Accordion>
    )
  }

  return <>{nodes}</>
}

function QuoteForm({
  quote,
  serviceOptionGroups,
  catalogServices,
  onSave,
  onCancel,
  isSubmitting = false,
}: {
  quote?: Quote | null
  serviceOptionGroups: ServiceOptionGroup[]
  /** Full rows from listAllServices (price is often a string in the API). */
  catalogServices: CatalogServiceRow[]
  onSave: (input: adminApi.Quote & { lineItems: LineItem[]; timelineEvents: TimelineEvent[] }) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const [quoteSection, setQuoteSection] = useState<'client' | 'lines' | 'timeline'>('client')
  const [clientName, setClientName] = useState(quote?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(quote?.clientEmail ?? '')
  const [status, setStatus] = useState(quote?.status ?? 'DRAFT')
  const [lineItems, setLineItems] = useState<LineItem[]>(() =>
    quote?.lineItems?.length ? ensureLineIdsDeep([...quote.lineItems]) : [emptyLineItem()]
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
    setLineItems(quote?.lineItems?.length ? ensureLineIdsDeep([...quote.lineItems]) : [emptyLineItem()])
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

  useEffect(() => {
    setQuoteSection('client')
  }, [quote?.id])

  const recalcTotal = useCallback(() => quoteLineItemsSubtotal(lineItems), [lineItems])
  const chartReady = timelineChartReadyCount(timelineEvents)
  const lineRowCount = useMemo(() => countAllLineRows(lineItems), [lineItems])

  const updateLineItemPath = (path: number[], field: keyof LineItem, value: string | number | null) => {
    setLineItems((prev) => updateLineAtPath(prev, path, field, value))
  }

  const pickCatalogServiceForPackage = useCallback(
    (path: number[], serviceId: string | null) => {
      const svc = serviceId ? catalogServices.find((s) => s.id === serviceId) : undefined
      const parsed = svc ? parseServiceCatalogPrice(svc.price) : null
      const unit = parsed === null ? undefined : parsed
      setLineItems((prev) => applyServiceCatalogToPackageLine(prev, path, serviceId, unit))
    },
    [catalogServices]
  )

  const addLine = () => setLineItems((prev) => [...prev, emptyLineItem()])
  const addSubLine = (path: number[]) => setLineItems((prev) => addSubLineAtPath(prev, path))
  const removeLine = (path: number[]) => {
    setLineItems((prev) => removeLineAtPath(prev, path))
  }

  const timelineLineOptions = useCallback(() => flattenLineItemsForSelect(lineItems), [lineItems])

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
    const items = prepareLineItemsForSave(lineItems)
    const total = quoteLineItemsSubtotal(items)
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

  const timelineProgress =
    timelineEvents.length === 0 ? 0 : Math.round((100 * chartReady) / timelineEvents.length)

  return (
    <Form
      id="admin-quote-editor-form"
      onSubmit={handleSubmit}
      className="quote-editor-form d-flex flex-column h-100"
    >
      <div className="quote-editor-form-scroll flex-grow-1 overflow-y-auto px-3 pt-3 pb-2">
      <div
        className="quote-form-sticky-summary sticky-top py-2 mb-3 border border-secondary border-opacity-25 rounded-3 px-2 px-sm-3"
        style={{ zIndex: 6, top: 0 }}
      >
        <Row className="align-items-center g-2 small">
          <Col xs={12} md="auto">
            <span className="text-white fw-bold fs-6">${recalcTotal().toFixed(2)}</span>
            <span className="text-white-50 ms-1">total</span>
          </Col>
          <Col xs="auto">
            <Badge bg="primary">{lineItems.length} package{lineItems.length === 1 ? '' : 's'}</Badge>
          </Col>
          <Col xs="auto">
            <Badge bg="secondary">{lineRowCount} line row{lineRowCount === 1 ? '' : 's'}</Badge>
          </Col>
          <Col xs="auto">
            <Badge bg={chartReady === timelineEvents.length && timelineEvents.length > 0 ? 'success' : 'warning'}>
              {timelineEvents.length === 0
                ? 'No timeline events'
                : `${chartReady}/${timelineEvents.length} chart-ready`}
            </Badge>
          </Col>
          <Col xs={12} md className="d-none d-md-block">
            <ProgressBar
              now={timelineProgress}
              variant={chartReady === timelineEvents.length ? 'success' : 'info'}
              striped={timelineEvents.length > 0 && chartReady < timelineEvents.length}
              animated={timelineEvents.length > 0 && chartReady < timelineEvents.length}
              className="mt-1"
              style={{ height: 6 }}
            />
          </Col>
        </Row>
      </div>

      <Tab.Container
        activeKey={quoteSection}
        onSelect={(k) => setQuoteSection((k as 'client' | 'lines' | 'timeline' | null) ?? 'client')}
      >
        <Nav variant="pills" className="quote-form-section-nav flex-wrap gap-1 mb-3">
          <Nav.Item>
            <Nav.Link eventKey="client">
              Client &amp; status
              {clientName.trim() ? (
                <Badge bg="light" text="dark" className="ms-1 rounded-pill">
                  ✓
                </Badge>
              ) : null}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="lines">
              Packages &amp; pricing
              <Badge bg="secondary" className="ms-1 rounded-pill">
                {lineItems.length}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="timeline">
              Timeline
              <Badge bg={timelineEvents.length ? 'info' : 'secondary'} className="ms-1 rounded-pill">
                {timelineEvents.length}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="client" className="pt-1">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Client name</Form.Label>
                  <Form.Control
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    placeholder="Company or contact"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Client email</Form.Label>
                  <Form.Control
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="DECLINED">Declined</option>
                  </Form.Select>
                  <Form.Text className="text-white-50">
                    Draft while you build; send when the client should see the portal link.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Tab.Pane>

          <Tab.Pane eventKey="lines" className="quote-line-items-panel pt-1">
            <Card className="quote-line-items-intro border-secondary bg-transparent mb-3">
              <Card.Body className="py-3 px-3">
                <p className="small text-white mb-0">
                  Each <strong className="text-info">package</strong> carries quantity × rate.{' '}
                  <strong className="text-white-50">Sub-lines</strong> add scope detail only (no extra charge in the
                  PDF table). Use the headers to collapse packages when editing long quotes.
                </p>
              </Card.Body>
            </Card>
            <LineItemRowsEditor
              items={lineItems}
              pathPrefix={[]}
              depth={0}
              serviceOptionGroups={serviceOptionGroups}
              onUpdate={updateLineItemPath}
              onPickCatalogService={pickCatalogServiceForPackage}
              onAddSubLine={addSubLine}
              onRemove={removeLine}
            />
            <div className="mt-4 d-flex flex-wrap gap-2 align-items-center">
              <AddLineButton onClick={addLine} />
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => setQuoteSection('timeline')}
              >
                Next: Timeline →
              </button>
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="timeline" className="quote-timeline-tab pt-1">
            <Row className="g-4">
              <Col xl={5}>
                <div className="quote-timeline-preview-sticky">
                  <AdminQuoteTimelinePreview events={timelineEvents} />
                </div>
              </Col>
              <Col xl={7}>
                <Card className="quote-timeline-editor-intro border-secondary bg-transparent mb-3">
                  <Card.Body className="py-3 px-3 d-flex flex-wrap align-items-start justify-content-between gap-2">
                    <p className="small text-white mb-0" style={{ maxWidth: 520 }}>
                      Short <strong className="text-info">chart labels</strong> read cleanly on the Gantt; keep long
                      copy in the description. The preview updates as you type—only rows with label + start + end
                      export to the client chart.
                    </p>
                    <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={addTimeline}>
                      + Add event
                    </button>
                  </Card.Body>
                </Card>
                {timelineEvents.length === 0 ? (
                  <Card className="bg-dark border-secondary border-dashed border-2 mb-3">
                    <Card.Body className="text-white-50 small py-4 text-center">
                      No milestones yet. Add events to build the timeline PDF and client package chart.
                    </Card.Body>
                  </Card>
                ) : (
                  <Accordion alwaysOpen defaultActiveKey={timelineEvents.map((_, i) => String(i))}>
                    {timelineEvents.map((ev, idx) => {
                      const ready = !!(ev.chartLabel.trim() && ev.startDate && ev.endDate)
                      const range =
                        ev.startDate && ev.endDate
                          ? `${formatClientFacingDate(ev.startDate)} → ${formatClientFacingDate(ev.endDate)}`
                          : 'Set dates'
                      const headLabel = ev.chartLabel.trim() || `Event ${idx + 1}`
                      return (
                        <Accordion.Item
                          key={ev.id}
                          eventKey={String(idx)}
                          className="bg-dark border border-secondary rounded-2 mb-3 overflow-hidden quote-timeline-card"
                        >
                          <Accordion.Header className="admin-quote-package-header">
                            <span className="d-flex align-items-center gap-2 flex-wrap w-100 pe-2">
                              <Badge bg={ready ? 'success' : 'warning'} className="rounded-pill">
                                {ready ? 'Chart-ready' : 'Incomplete'}
                              </Badge>
                              <span className="fw-semibold text-truncate" style={{ maxWidth: 280 }}>
                                {headLabel}
                              </span>
                              <span className="text-white-50 small ms-md-auto">{range}</span>
                            </span>
                          </Accordion.Header>
                          <Accordion.Body className="quote-timeline-event-body pt-3 pb-3 border-top border-secondary">
                            <Row className="g-3">
                              <Col md={6}>
                                <Form.Label className="quote-line-label mb-1">Chart label</Form.Label>
                                <Form.Control
                                  className="quote-line-input-lg"
                                  placeholder="Short label (shown on chart)"
                                  value={ev.chartLabel}
                                  onChange={(e) => updateTimeline(idx, 'chartLabel', e.target.value)}
                                />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="quote-line-label mb-1">Linked deliverable</Form.Label>
                                <Form.Select
                                  className="quote-line-input-lg"
                                  aria-label="Deliverable"
                                  value={ev.lineItemId ?? ''}
                                  onChange={(e) =>
                                    updateTimeline(idx, 'lineItemId', e.target.value === '' ? null : e.target.value)
                                  }
                                >
                                  <option value="">Project milestone (no line)</option>
                                  {timelineLineOptions().map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Col>
                              <Col sm={6} md={3}>
                                <Form.Label className="quote-line-label mb-1">Start</Form.Label>
                                <Form.Control
                                  className="quote-line-input-lg"
                                  type="date"
                                  value={ev.startDate ? ev.startDate.slice(0, 10) : ''}
                                  onChange={(e) => updateTimeline(idx, 'startDate', e.target.value)}
                                />
                              </Col>
                              <Col sm={6} md={3}>
                                <Form.Label className="quote-line-label mb-1">End</Form.Label>
                                <Form.Control
                                  className="quote-line-input-lg"
                                  type="date"
                                  value={ev.endDate ? ev.endDate.slice(0, 10) : ''}
                                  onChange={(e) => updateTimeline(idx, 'endDate', e.target.value)}
                                />
                              </Col>
                              <Col xs={12} className="d-flex justify-content-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removeTimeline(idx)}
                                >
                                  Remove event
                                </button>
                              </Col>
                              <Col xs={12}>
                                <Form.Label className="quote-line-label mb-1">Description</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  className="quote-line-textarea"
                                  placeholder="Scope notes, assumptions, deliverables…"
                                  value={ev.description ?? ''}
                                  onChange={(e) => updateTimeline(idx, 'description', e.target.value)}
                                />
                              </Col>
                            </Row>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                    })}
                  </Accordion>
                )}
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      </div>

      <div className="quote-editor-form-footer flex-shrink-0 px-3 py-3 mt-0">
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div>
            <span className="quote-editor-footer-kicker d-block">Quote total</span>
            <span className="quote-editor-footer-total">${recalcTotal().toFixed(2)}</span>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={() => setQuoteSection('client')}
            >
              Overview
            </button>
            <button type="button" className="btn btn-outline-light" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary quote-editor-submit px-4" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : quote ? 'Save quote' : 'Create quote'}
            </button>
          </div>
        </div>
      </div>
    </Form>
  )
}

export default function AdminQuotes() {
  const queryClient = useQueryClient()
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** Create/update quote errors shown inside the editor modal */
  const [quoteModalError, setQuoteModalError] = useState<string | null>(null)
  const [quotePdfLoadingId, setQuotePdfLoadingId] = useState<string | null>(null)
  const [invoicePdfLoadingId, setInvoicePdfLoadingId] = useState<string | null>(null)

  const closeQuoteModal = () => {
    setShowQuoteModal(false)
    setQuoteModalError(null)
  }

  const { data: listServicesData } = useListAllServicesQuery(graphqlClient)
  const catalogServices = listServicesData?.listAllServices ?? []
  const serviceOptionGroups = useMemo(() => buildServiceOptionGroups(catalogServices), [catalogServices])

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
      setQuoteModalError(null)
      setShowQuoteModal(false)
      setEditingQuote(null)
    },
    onError: (err) => setQuoteModalError(err instanceof Error ? err.message : String(err)),
  })
  const updateQuoteMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof adminApi.updateQuote>[1] }) =>
      adminApi.updateQuote(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] })
      setQuoteModalError(null)
      setShowQuoteModal(false)
      setEditingQuote(null)
    },
    onError: (err) => setQuoteModalError(err instanceof Error ? err.message : String(err)),
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
    setQuoteModalError(null)
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
          lineItems: raw.lineItems.map(lineItemToMutationInput),
          total: raw.total,
          timelineEvents: timelinePayload,
        },
      })
    } else {
      createQuoteMut.mutate({
        clientName: raw.clientName,
        clientEmail: raw.clientEmail,
        status: raw.status,
        lineItems: raw.lineItems.map(lineItemToMutationInput),
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
                    setQuoteModalError(null)
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
                          <td>${quoteDisplayTotal(q.lineItems, q.total).toFixed(2)}</td>
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
                                    setQuoteModalError(null)
                                    setEditingQuote(q)
                                    setShowQuoteModal(true)
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  disabled={deleteQuoteMut.isPending && deleteQuoteMut.variables === q.id}
                                  onClick={() => deleteQuoteMut.mutate(q.id)}
                                >
                                  {deleteQuoteMut.isPending && deleteQuoteMut.variables === q.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                      Deleting…
                                    </>
                                  ) : (
                                    'Delete'
                                  )}
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
                                  disabled={quotePdfLoadingId === q.id}
                                  onClick={async () => {
                                    setError(null)
                                    setQuotePdfLoadingId(q.id)
                                    try {
                                      await downloadQuotePdf(q)
                                    } catch (err) {
                                      setError(err instanceof Error ? err.message : String(err))
                                    } finally {
                                      setQuotePdfLoadingId(null)
                                    }
                                  }}
                                >
                                  {quotePdfLoadingId === q.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                      PDF…
                                    </>
                                  ) : (
                                    'PDF'
                                  )}
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
                                  disabled={generatePackageMut.isPending && generatePackageMut.variables === q.id}
                                  onClick={() => {
                                    setError(null)
                                    generatePackageMut.mutate(q.id)
                                  }}
                                >
                                  {generatePackageMut.isPending && generatePackageMut.variables === q.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                      Generating…
                                    </>
                                  ) : (
                                    'Client package'
                                  )}
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
                                    downloadPackageMut.variables === q.id ? (
                                      <>
                                        <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                        Preparing…
                                      </>
                                    ) : (
                                      'Download package'
                                    )}
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
                                  disabled={convertMut.isPending && convertMut.variables === q.id}
                                  onClick={() => convertMut.mutate(q.id)}
                                >
                                  {convertMut.isPending && convertMut.variables === q.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                      Converting…
                                    </>
                                  ) : (
                                    'To invoice'
                                  )}
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
                          <td>${quoteDisplayTotal(inv.lineItems, inv.total).toFixed(2)}</td>
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
                                disabled={invoicePdfLoadingId === inv.id}
                                onClick={async () => {
                                  setError(null)
                                  setInvoicePdfLoadingId(inv.id)
                                  try {
                                    await downloadInvoicePdf(inv)
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : String(err))
                                  } finally {
                                    setInvoicePdfLoadingId(null)
                                  }
                                }}
                              >
                                {invoicePdfLoadingId === inv.id ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                    PDF…
                                  </>
                                ) : (
                                  'PDF'
                                )}
                              </button>
                              {inv.status !== 'PAID' && (
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm"
                                  disabled={markPaidMut.isPending && markPaidMut.variables === inv.id}
                                  onClick={() => markPaidMut.mutate(inv.id)}
                                >
                                  {markPaidMut.isPending && markPaidMut.variables === inv.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" aria-hidden />
                                      Saving…
                                    </>
                                  ) : (
                                    'Mark paid'
                                  )}
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

      <Modal
        show={showQuoteModal}
        onHide={closeQuoteModal}
        size="xl"
        className="admin-modal admin-modal-quote-editor"
        contentClassName="admin-modal-quote-content"
        dialogClassName="admin-modal-quote-dialog"
      >
        <Modal.Header closeButton className="quote-editor-modal-header">
          <div>
            <Modal.Title as="h2" className="quote-editor-modal-title mb-1">
              {editingQuote ? 'Edit quote' : 'New quote'}
            </Modal.Title>
            <p className="quote-editor-modal-subtitle mb-0">
              {editingQuote
                ? `${editingQuote.clientName || 'Unnamed client'} · ${editingQuote.status ?? 'DRAFT'}`
                : 'Client, packages, timeline — save when ready.'}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body className="quote-editor-modal-body">
          {quoteModalError ? (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setQuoteModalError(null)}
              className="mb-3 flex-shrink-0"
            >
              {quoteModalError}
            </Alert>
          ) : null}
          <QuoteForm
            key={editingQuote?.id ?? 'new'}
            quote={editingQuote}
            serviceOptionGroups={serviceOptionGroups}
            catalogServices={catalogServices}
            onSave={handleSaveQuote}
            onCancel={closeQuoteModal}
            isSubmitting={createQuoteMut.isPending || updateQuoteMut.isPending}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}
