import type { LineItem, TimelineEvent } from '../api/admin-api'

export function inclusiveCalendarDays(startIso: string, endIso: string): number {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  const d0 = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  const d1 = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  return Math.floor((d1 - d0) / 86400000) + 1
}

export function timelineDaySpanLabel(startIso: string, endIso: string): string {
  const n = inclusiveCalendarDays(startIso, endIso)
  if (n <= 0) return ''
  return n === 1 ? '1 day' : `${n} days`
}

/** e.g. Jan 1, 2026 — calendar date for YYYY-MM-DD ISO strings (local), else parsed as Date. */
export function formatClientFacingDate(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === '') return '—'
  const s = String(iso).trim()
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    if (Number.isNaN(dt.getTime())) return s.slice(0, 10)
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  const dt = new Date(s)
  if (Number.isNaN(dt.getTime())) return s
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function eventRangeLabelForClient(ev: TimelineEvent): string {
  const start = formatClientFacingDate(ev.startDate)
  const end = formatClientFacingDate(ev.endDate)
  const days = timelineDaySpanLabel(ev.startDate, ev.endDate)
  return days ? `${start} → ${end} · ${days}` : `${start} → ${end}`
}

/** Top-level payable amount (package or single line). */
export function lineItemPayableAmount(li: LineItem): number {
  const q = Number(li.quantity) || 0
  const p = Number(li.unitPrice) || 0
  const stored = Number(li.amount) || 0
  if (li.subLineItems?.length) {
    return stored || q * p
  }
  return stored || q * p
}

export function quoteLineItemsSubtotal(items: LineItem[]): number {
  return items.reduce((s, li) => s + lineItemPayableAmount(li), 0)
}

/** Trimmed title and description for layout (e.g. title row + smaller detail row). */
export function lineItemTitleDescriptionParts(li: LineItem): { title: string; description: string } {
  return {
    title: (li.title ?? '').trim(),
    description: (li.description ?? '').trim(),
  }
}

/** Plain-text fallback (e.g. single-field copy); newline between title and description. */
export function formatLineItemTitleDescription(li: LineItem): string {
  const { title, description } = lineItemTitleDescriptionParts(li)
  if (title && description) return `${title}\n${description}`
  if (title) return title
  return description || '—'
}

/** Prefer stored quote total when present; otherwise sum top-level payable line amounts. */
export function quoteDisplayTotal(lineItems: LineItem[] | undefined | null, storedTotal?: number | null): number {
  const items = lineItems ?? []
  const st = Number(storedTotal)
  const sub = quoteLineItemsSubtotal(items)
  if (!Number.isNaN(st) && st > 0) return st
  return sub
}
